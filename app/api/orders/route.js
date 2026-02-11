import { requireAuth } from '../../../lib/auth-server';
import { parsePagination } from '../../../lib/api-utils';

export async function GET(request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams, { defaultLimit: 200, maxLimit: 500 });

    return Response.json({
      success: true,
      data: [],
      meta: {
        limit,
        offset,
        hasMore: false,
        nextOffset: null,
      },
    });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
