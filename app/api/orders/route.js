import { requireAuth } from '../../../lib/auth-server';
import { parsePagination } from '../../../lib/api-utils';
import { getDummyOrders } from '../../../lib/orders-dummy';

export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams, { defaultLimit: 200, maxLimit: 500 });

    const orders = getDummyOrders(user.id);
    const paged = orders.slice(offset, offset + limit + 1);
    const hasMore = paged.length > limit;

    return Response.json({
      success: true,
      data: hasMore ? paged.slice(0, limit) : paged,
      meta: {
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
