import { requireAuth } from '../../../lib/auth-server';
import { createCatalogItem, getCatalogItems } from '../../../lib/db-helpers';
import { parsePagination, parseSearch, parseStatus } from '../../../lib/api-utils';

const parseType = (searchParams) => {
  const value = searchParams?.get('type');
  if (!value) return 'all';
  const normalized = value.trim().toLowerCase();
  if (['service', 'product', 'all'].includes(normalized)) return normalized;
  return 'all';
};

const parseBoolean = (value, fallback = false) => {
  if (value === true || value === false) return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
};

const parseNumber = (value, fallback = null) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num;
};

export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePagination(searchParams, { defaultLimit: 200, maxLimit: 500 });
    const search = parseSearch(searchParams);
    let status = parseStatus(searchParams, 'all');
    if (!['all', 'active', 'inactive'].includes(status)) {
      status = 'all';
    }
    const type = parseType(searchParams);

    const items = await getCatalogItems(user.id, { type, status, search, limit: limit + 1, offset });
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;

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
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const itemType = String(body?.item_type || body?.type || '').trim().toLowerCase();
    const name = String(body?.name || '').trim();

    if (!['service', 'product'].includes(itemType)) {
      return Response.json({ success: false, error: 'Invalid item type.' }, { status: 400 });
    }
    if (!name) {
      return Response.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }

    const item = await createCatalogItem({
      adminId: user.id,
      item_type: itemType,
      name,
      category: String(body?.category || '').trim(),
      description: String(body?.description || '').trim(),
      price_label: String(body?.price_label || '').trim(),
      duration_minutes: itemType === 'service' ? parseNumber(body?.duration_minutes) : null,
      details_prompt: String(body?.details_prompt || '').trim(),
      keywords: body?.keywords,
      is_active: parseBoolean(body?.is_active, true),
      sort_order: parseNumber(body?.sort_order, 0),
      is_bookable: itemType === 'service' ? parseBoolean(body?.is_bookable, false) : false,
    });

    return Response.json({ success: true, data: item });
  } catch (error) {
    if (error.status === 401) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
