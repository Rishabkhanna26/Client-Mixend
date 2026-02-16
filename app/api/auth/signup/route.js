import { NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/db-helpers';
import { hashPassword, signAuthToken } from '../../../../lib/auth';
import { sanitizeEmail, sanitizeNameUpper, sanitizePhone, sanitizeText } from '../../../../lib/sanitize.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const name = sanitizeNameUpper(body.name);
    const email = sanitizeEmail(body.email);
    const phone = sanitizePhone(body.phone);
    const password = body.password || '';
    const businessCategory = sanitizeText(body.business_category, 120);
    const businessTypeRaw = typeof body.business_type === 'string' ? body.business_type.trim().toLowerCase() : '';
    const allowedBusinessTypes = new Set(['product', 'service', 'both']);
    const businessType = allowedBusinessTypes.has(businessTypeRaw) ? businessTypeRaw : 'both';

    if (!name || !phone || !password || !businessCategory) {
      return NextResponse.json(
        { error: 'Valid name, phone, password, and business category are required' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    try {
      const [existing] = await connection.execute(
        `SELECT id, phone, email
         FROM admins
         WHERE phone = ?
            OR regexp_replace(phone, '\\D', '', 'g') = ?
            OR email = ?`,
        [phone, phone, email]
      );

      if (existing.length > 0) {
        const phoneExists = existing.some((row) => sanitizePhone(row.phone) === phone);
        const emailExists = email
          ? existing.some((row) => sanitizeEmail(row.email) === email)
          : false;
        return NextResponse.json(
          {
            error: 'An account with this phone or email already exists',
            fields: {
              phone: phoneExists,
              email: emailExists,
            },
          },
          { status: 409 }
        );
      }

      const [superAdmins] = await connection.execute(
        `SELECT COUNT(*) as count FROM admins WHERE admin_tier = 'super_admin'`
      );
      const hasSuperAdmin = Number(superAdmins[0]?.count || 0) > 0;

      let adminTier = 'client_admin';
      let status = 'inactive';
      if (!hasSuperAdmin) {
        adminTier = 'super_admin';
        status = 'active';
      }

      const passwordHash = hashPassword(password);

      const [rows] = await connection.query(
        `INSERT INTO admins (
            name, phone, email, password_hash, admin_tier, status,
            business_category, business_type
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`,
        [name, phone, email, passwordHash, adminTier, status, businessCategory, businessType]
      );
      const insertedId = rows[0]?.id;

      const response = NextResponse.json({
        user: {
          id: insertedId,
          name,
          email,
          phone,
          admin_tier: adminTier,
          status,
          business_category: businessCategory,
          business_type: businessType,
        },
        requires_activation: status !== 'active',
      });
      if (status === 'active') {
        const token = signAuthToken({
          id: insertedId,
          name,
          email,
          phone,
          admin_tier: adminTier,
          status,
          business_category: businessCategory,
          business_type: businessType,
        });

        response.cookies.set({
          name: 'auth_token',
          value: token,
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          secure: process.env.NODE_ENV === 'production',
        });
      }

      return response;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
