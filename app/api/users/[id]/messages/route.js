import { addMessage, getMessagesForUser, getUserById } from '../../../../../lib/db-helpers';
import { parsePagination } from '../../../../../lib/api-utils';
import { requireAuth } from '../../../../../lib/auth-server';

export const runtime = 'nodejs';

export async function GET(req, context) {
  try {
    const authUser = await requireAuth();
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams, { defaultLimit: 50, maxLimit: 200 });
    const beforeRaw = searchParams.get('before');
    const beforeDate = beforeRaw ? new Date(beforeRaw) : null;
    const before = beforeDate && !Number.isNaN(beforeDate.getTime()) ? beforeDate.toISOString() : null;
    const params = await context.params;
    const userId = Number(params?.id);
    if (!Number.isFinite(userId)) {
      return Response.json({ success: false, error: 'Invalid user id' }, { status: 400 });
    }
    const messages = await getMessagesForUser(
      userId,
      authUser.admin_tier === 'super_admin' ? null : authUser.id,
      {
        limit: limit + 1,
        offset,
        before,
      }
    );
    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, limit) : messages;
    const response = Response.json({
      success: true,
      data,
      meta: {
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    });
    response.headers.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=15');
    return response;
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req, context) {
  try {
    const authUser = await requireAuth();
    const params = await context.params;
    const userId = Number(params?.id);
    if (!Number.isFinite(userId)) {
      return Response.json({ success: false, error: 'Invalid user id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || '').trim();
    if (!message) {
      return Response.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    if (authUser.admin_tier !== 'super_admin') {
      const user = await getUserById(userId, authUser.id);
      if (!user) {
        return Response.json({ success: false, error: 'Contact not found' }, { status: 404 });
      }
    }

    const messageId = await addMessage(userId, authUser.id, message, 'outgoing');
    return Response.json({
      success: true,
      data: {
        id: messageId,
        user_id: userId,
        admin_id: authUser.id,
        message_text: message,
        message_type: 'outgoing',
        status: 'sent',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
