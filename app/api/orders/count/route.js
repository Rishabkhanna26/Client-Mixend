import { requireAuth } from '../../../../lib/auth-server';
import { getDummyOrders } from '../../../../lib/orders-dummy';

const parseSince = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since');
    const sinceDate = parseSince(sinceParam);
    const orders = getDummyOrders(user.id);
    const count = sinceDate
      ? orders.filter((order) => {
          const createdAt = new Date(order.created_at || order.placed_at || 0);
          return !Number.isNaN(createdAt.getTime()) && createdAt > sinceDate;
        }).length
      : orders.length;
    return Response.json({ success: true, count });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
