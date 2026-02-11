import { requireAuth } from '../../../../lib/auth-server';

export async function PATCH(request, { params }) {
  try {
    await requireAuth();
    const orderId = params?.id ? String(params.id) : null;
    if (!orderId) {
      return Response.json({ success: false, error: 'Order id is required.' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    return Response.json({
      success: true,
      data: {
        id: orderId,
        ...body,
      },
    });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
