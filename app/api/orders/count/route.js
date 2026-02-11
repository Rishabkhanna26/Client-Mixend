import { requireAuth } from '../../../../lib/auth-server';

export async function GET() {
  try {
    await requireAuth();
    return Response.json({ success: true, count: 0 });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
