import pg from "pg";
import { initDatabase } from "./init.js";
import { hashPassword } from "../lib/auth.js";
import { getDummyOrders } from "../lib/orders-dummy.js";

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}

const now = new Date();
const atDaysAgo = (days, hour = 10, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const adminSeeds = [
  {
    name: "Neha Sharma",
    phone: "9000000001",
    email: "neha.admin1@example.com",
    business_category: "Astro Consultancy",
    business_type: "service",
    whatsapp_name: "Neha S",
  },
  {
    name: "Arjun Mehta",
    phone: "9000000002",
    email: "arjun.admin2@example.com",
    business_category: "Clinic",
    business_type: "service",
    whatsapp_name: "Arjun M",
  },
  {
    name: "Zara Khan",
    phone: "9000000003",
    email: "zara.admin3@example.com",
    business_category: "Restaurant",
    business_type: "product",
    whatsapp_name: "Zara K",
  },
  {
    name: "Vivaan Patel",
    phone: "9000000004",
    email: "vivaan.admin4@example.com",
    business_category: "Salon",
    business_type: "service",
    whatsapp_name: "Vivaan P",
  },
  {
    name: "Priya Gupta",
    phone: "9000000005",
    email: "priya.admin5@example.com",
    business_category: "Retail Shop",
    business_type: "both",
    whatsapp_name: "Priya G",
  },
];

const contactSeeds = [
  { name: "Aarav Rao", phone: "9100000001", email: "aarav@example.com" },
  { name: "Diya Sen", phone: "9100000002", email: "diya@example.com" },
  { name: "Kabir Joshi", phone: "9100000003", email: "kabir@example.com" },
  { name: "Nisha Verma", phone: "9100000004", email: "nisha@example.com" },
  { name: "Ritika Das", phone: "9100000005", email: "ritika@example.com" },
  { name: "Ishaan Kapoor", phone: "9100000006", email: "ishaan@example.com" },
  { name: "Maya Singh", phone: "9100000007", email: "maya@example.com" },
  { name: "Ravi Kumar", phone: "9100000008", email: "ravi@example.com" },
  { name: "Sara Ali", phone: "9100000009", email: "sara@example.com" },
  { name: "Tanvi Shah", phone: "9100000010", email: "tanvi@example.com" },
];

const catalogByBusinessType = {
  service: {
    services: [
      ["Birth Chart Reading", "consultation", "INR 999", 60],
      ["Compatibility Match", "consultation", "INR 1199", 75],
      ["Career Guidance", "consultation", "INR 899", 50],
    ],
    products: [["Personalized Report PDF", "digital", "INR 499"]],
  },
  product: {
    services: [
      ["Personal Shopping Assist", "assist", "INR 399", 30],
      ["Bulk Order Assist", "assist", "INR 599", 45],
    ],
    products: [
      ["Starter Pack", "bundle", "INR 1499"],
      ["Premium Pack", "bundle", "INR 2999"],
    ],
  },
  both: {
    services: [
      ["Initial Consultation", "consultation", "INR 699", 30],
      ["Follow-up Visit", "consultation", "INR 499", 20],
      ["Teleconsultation", "telehealth", "INR 399", 20],
    ],
    products: [["Wellness Kit", "merchandise", "INR 999"]],
  },
};

async function seedAdmins(client) {
  const seeded = [];
  for (const admin of adminSeeds) {
    const { rows } = await client.query(
      `INSERT INTO admins
        (name, phone, email, password_hash, admin_tier, status, business_category, business_type, whatsapp_name, whatsapp_connected_at)
       VALUES ($1, $2, $3, $4, 'client_admin', 'active', $5, $6, $7, NOW())
       ON CONFLICT (phone) DO UPDATE
       SET name = EXCLUDED.name,
           email = EXCLUDED.email,
           business_category = EXCLUDED.business_category,
           business_type = EXCLUDED.business_type,
           whatsapp_name = EXCLUDED.whatsapp_name,
           updated_at = NOW()
       RETURNING id, name, business_category, business_type`,
      [
        admin.name,
        admin.phone,
        admin.email,
        hashPassword("admin1234"),
        admin.business_category,
        admin.business_type,
        admin.whatsapp_name,
      ]
    );
    if (rows[0]) seeded.push(rows[0]);
  }

  const { rows: allRows } = await client.query(
    `SELECT id, name, business_category, business_type, admin_tier FROM admins ORDER BY id ASC`
  );
  return allRows;
}

async function seedContacts(client, admins) {
  const seeded = [];
  for (let i = 0; i < contactSeeds.length; i += 1) {
    const contact = contactSeeds[i];
    const admin = admins[i % admins.length];
    const { rows } = await client.query(
      `INSERT INTO contacts (name, phone, email, assigned_admin_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone) DO UPDATE
       SET name = EXCLUDED.name,
           email = EXCLUDED.email,
           assigned_admin_id = EXCLUDED.assigned_admin_id,
           updated_at = NOW()
       RETURNING id, assigned_admin_id, name, phone`,
      [contact.name, contact.phone, contact.email, admin.id]
    );
    if (rows[0]) seeded.push(rows[0]);
  }
  return seeded;
}

async function seedMessages(client, contacts) {
  const pairs = [
    ["Hi, I want to know your pricing.", "incoming", "read"],
    ["Sure, I can share the brochure.", "outgoing", "delivered"],
    ["Can we book a session this week?", "incoming", "read"],
    ["Yes, tomorrow 4 PM works.", "outgoing", "delivered"],
    ["Please send payment link.", "incoming", "sent"],
    ["Payment link sent.", "outgoing", "sent"],
  ];

  for (let i = 0; i < contacts.length; i += 1) {
    const contact = contacts[i];
    const createdTimes = [atDaysAgo(3, 11), atDaysAgo(3, 11, 10), atDaysAgo(1, 15), atDaysAgo(1, 15, 5)];

    for (let j = 0; j < pairs.length; j += 1) {
      const [text, type, status] = pairs[j];
      const createdAt = createdTimes[j % createdTimes.length];
      await client.query(
        `INSERT INTO messages (user_id, admin_id, message_text, message_type, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [contact.id, contact.assigned_admin_id, text, type, status, createdAt]
      );
    }
  }
}

async function seedLeadsAndNeeds(client, contacts) {
  const leadSeeds = [
    ["Need pricing for premium package", "pricing", "pending"],
    ["Looking for personalized consultation", "service", "in_progress"],
    ["Interested in subscription details", "subscription", "completed"],
  ];

  const needSeeds = [
    ["Send brochure PDF", "high", "open"],
    ["Schedule follow-up call", "medium", "assigned"],
    ["Share payment link", "urgent", "open"],
  ];

  for (let i = 0; i < contacts.length; i += 1) {
    const contact = contacts[i];

    for (const [text, category, status] of leadSeeds) {
      await client.query(
        `INSERT INTO leads (user_id, requirement_text, category, status)
         VALUES ($1, $2, $3, $4)`,
        [contact.id, text, category, status]
      );
    }

    for (const [needText, priority, status] of needSeeds) {
      await client.query(
        `INSERT INTO tasks (user_id, need_text, priority, status, assigned_to)
         VALUES ($1, $2, $3, $4, $5)`,
        [contact.id, needText, priority, status, contact.assigned_admin_id]
      );
    }
  }
}

async function seedAppointments(client, contacts) {
  for (let i = 0; i < contacts.length; i += 1) {
    const contact = contacts[i];
    const start = atDaysAgo(-(i + 1), 10 + (i % 5), 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);

    const paymentTotal = 600 + (i % 4) * 300;
    const paymentPaid = i % 3 === 0 ? paymentTotal : i % 3 === 1 ? Math.round(paymentTotal * 0.5) : 0;

    await client.query(
      `INSERT INTO appointments
        (user_id, admin_id, appointment_type, start_time, end_time, status, payment_total, payment_paid, payment_method, payment_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        contact.id,
        contact.assigned_admin_id,
        "Consultation",
        start,
        end.toISOString(),
        i % 4 === 0 ? "completed" : "booked",
        paymentTotal,
        paymentPaid,
        paymentPaid > 0 ? "upi" : null,
        paymentPaid > 0 && paymentPaid < paymentTotal
          ? JSON.stringify({ note: "Partial paid", services: [{ name: "Consultation", amount: String(paymentTotal) }] })
          : JSON.stringify({ note: "", services: [{ name: "Consultation", amount: String(paymentTotal) }] }),
      ]
    );
  }
}

async function seedOrders(client, admins) {
  for (const admin of admins) {
    const orders = getDummyOrders(admin.id, admin.business_type || "both").slice(0, 8);
    for (const order of orders) {
      await client.query(
        `INSERT INTO orders
          (admin_id, order_number, customer_name, customer_phone, customer_email, channel, status, fulfillment_status,
           delivery_method, delivery_address, items, notes, assigned_to, placed_at, created_at,
           payment_total, payment_paid, payment_status, payment_method, payment_notes, payment_currency)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11::jsonb, $12::jsonb, $13, $14, $15,
           $16, $17, $18, $19, $20, $21)`,
        [
          admin.id,
          order.order_number || null,
          order.customer_name || null,
          order.customer_phone || null,
          order.customer_email || null,
          order.channel || "WhatsApp",
          order.status || "new",
          order.fulfillment_status || "unfulfilled",
          order.delivery_method || null,
          order.delivery_address || null,
          JSON.stringify(order.items || []),
          JSON.stringify(order.notes || []),
          order.assigned_to || admin.name,
          order.placed_at || null,
          order.created_at || now.toISOString(),
          Number(order.total_amount || 0),
          order.payment_status === "paid" ? Number(order.total_amount || 0) : 0,
          order.payment_status || "pending",
          order.payment_status === "paid" ? "upi" : null,
          order.payment_status === "paid" ? "Paid in full" : null,
          order.currency || "INR",
        ]
      );
    }
  }
}

async function seedBroadcasts(client, admins) {
  const seeds = [
    ["Weekly Tips", "Here are this week's top tips.", "sent", 120, 110],
    ["New Package Launch", "We launched a new package.", "scheduled", 0, 0],
    ["Weekend Offer", "Book this weekend for a discount.", "draft", 0, 0],
  ];

  for (let i = 0; i < seeds.length; i += 1) {
    const [title, message, status, sentCount, deliveredCount] = seeds[i];
    await client.query(
      `INSERT INTO broadcasts
        (title, message, target_audience_type, scheduled_at, status, sent_count, delivered_count, created_by)
       VALUES ($1, $2, 'all', $3, $4, $5, $6, $7)`,
      [
        title,
        message,
        status === "scheduled" ? atDaysAgo(-2, 9, 0) : null,
        status,
        sentCount,
        deliveredCount,
        admins[i % admins.length].id,
      ]
    );
  }
}

async function seedTemplates(client, admins) {
  const seeds = [
    ["Welcome Message", "onboarding", "Welcome to AlgoAura!", '["name"]'],
    ["Payment Link", "billing", "Here is your payment link: {{link}}", '["link"]'],
    ["Appointment Confirmed", "appointments", "Your appointment is confirmed for {{date}} at {{time}}.", '["date","time"]'],
  ];

  for (let i = 0; i < seeds.length; i += 1) {
    const [name, category, content, variables] = seeds[i];
    await client.query(
      `INSERT INTO templates (name, category, content, variables_json, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, category, content, variables, admins[i % admins.length].id]
    );
  }
}

async function seedCatalog(client, admins) {
  for (const admin of admins) {
    const catalog =
      catalogByBusinessType[admin.business_type] || catalogByBusinessType.both;

    let sort = 0;
    for (const [name, category, priceLabel, durationMinutes] of catalog.services) {
      await client.query(
        `INSERT INTO catalog_items
          (admin_id, item_type, name, category, description, price_label, duration_minutes, is_bookable, sort_order)
         VALUES ($1, 'service', $2, $3, $4, $5, $6, TRUE, $7)`,
        [
          admin.id,
          name,
          category,
          `${name} for ${admin.business_category || "General"}`,
          priceLabel,
          durationMinutes,
          sort,
        ]
      );
      sort += 1;
    }

    for (const [name, category, priceLabel] of catalog.products) {
      await client.query(
        `INSERT INTO catalog_items
          (admin_id, item_type, name, category, description, price_label, is_bookable, sort_order)
         VALUES ($1, 'product', $2, $3, $4, $5, FALSE, $6)`,
        [
          admin.id,
          name,
          category,
          `${name} for ${admin.business_category || "General"}`,
          priceLabel,
          sort,
        ]
      );
      sort += 1;
    }
  }
}

async function printCounts(client) {
  const tables = [
    "admins",
    "contacts",
    "messages",
    "leads",
    "tasks",
    "appointments",
    "orders",
    "broadcasts",
    "templates",
    "catalog_items",
  ];

  const result = {};
  for (const table of tables) {
    const { rows } = await client.query(`SELECT COUNT(*)::int as count FROM ${table}`);
    result[table] = rows[0]?.count || 0;
  }

  console.log("✅ Seed complete.", result);
}

async function seedDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query("BEGIN");

    const admins = await seedAdmins(client);
    const contacts = await seedContacts(client, admins.filter((a) => a.admin_tier !== "super_admin"));

    await seedMessages(client, contacts);
    await seedLeadsAndNeeds(client, contacts);
    await seedAppointments(client, contacts);
    await seedOrders(client, admins.filter((a) => a.admin_tier !== "super_admin"));
    await seedBroadcasts(client, admins);
    await seedTemplates(client, admins);
    await seedCatalog(client, admins.filter((a) => a.admin_tier !== "super_admin"));

    await client.query("COMMIT");
    await printCounts(client);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

console.log("🚀 Recreating and seeding database...");
initDatabase({ recreate: true })
  .then(seedDatabase)
  .then(() => {
    console.log("✅ Database ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  });
