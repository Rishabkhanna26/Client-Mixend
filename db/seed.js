import pg from "pg";
import { initDatabase } from "./init.js";
import { hashPassword } from "../lib/auth.js";

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

const TARGETS = {
  admins: 5,
  users: 10,
  messages: 10,
  requirements: 8,
  appointments: 6,
  needs: 8,
  broadcasts: 5,
  templates: 6,
  catalog: 10,
};

const adminSeeds = [
  {
    name: "Neha Sharma",
    phone: "9000000001",
    email: "neha.admin1@example.com",
    profession: "astrology",
    whatsapp_name: "Neha S",
  },
  {
    name: "Arjun Mehta",
    phone: "9000000002",
    email: "arjun.admin2@example.com",
    profession: "gym",
    whatsapp_name: "Arjun M",
  },
  {
    name: "Zara Khan",
    phone: "9000000003",
    email: "zara.admin3@example.com",
    profession: "restaurant",
    whatsapp_name: "Zara K",
  },
  {
    name: "Vivaan Patel",
    phone: "9000000004",
    email: "vivaan.admin4@example.com",
    profession: "salon",
    whatsapp_name: "Vivaan P",
  },
  {
    name: "Meera Iyer",
    phone: "9000000005",
    email: "meera.admin5@example.com",
    profession: "clinic",
    whatsapp_name: "Meera I",
  },
  {
    name: "Rohan Das",
    phone: "9000000006",
    email: "rohan.admin6@example.com",
    profession: "ecommerce",
    whatsapp_name: "Rohan D",
  },
];

const userSeeds = [
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

const messageSeeds = [
  { text: "Hi, I want to know your pricing.", type: "incoming", status: "read" },
  { text: "Sure, I can share the brochure.", type: "outgoing", status: "delivered" },
  { text: "Can we book a session this week?", type: "incoming", status: "read" },
  { text: "We have a slot at 4 PM tomorrow.", type: "outgoing", status: "sent" },
  { text: "Please send the payment link.", type: "incoming", status: "delivered" },
  { text: "Link sent. Let me know if you face issues.", type: "outgoing", status: "read" },
  { text: "Do you offer weekend appointments?", type: "incoming", status: "sent" },
  { text: "Yes, Saturday 11 AM is available.", type: "outgoing", status: "delivered" },
  { text: "I want to update my profile details.", type: "incoming", status: "read" },
  { text: "I have updated it for you.", type: "outgoing", status: "read" },
];

const requirementSeeds = [
  { text: "Need pricing for premium package", category: "pricing", status: "pending" },
  { text: "Looking for personalized consultation", category: "service", status: "in_progress" },
  { text: "Want to compare package tiers", category: "pricing", status: "pending" },
  { text: "Interested in monthly subscription", category: "subscription", status: "completed" },
  { text: "Need details about add-on services", category: "service", status: "pending" },
  { text: "Requesting product demo", category: "demo", status: "in_progress" },
  { text: "Need refund policy details", category: "policy", status: "completed" },
  { text: "Asking about group discounts", category: "discount", status: "pending" },
];

const needSeeds = [
  { text: "Send brochure PDF", priority: "high", status: "open" },
  { text: "Schedule follow-up call", priority: "medium", status: "assigned" },
  { text: "Share payment link", priority: "urgent", status: "open" },
  { text: "Update customer details", priority: "low", status: "completed" },
  { text: "Collect feedback after session", priority: "medium", status: "open" },
  { text: "Confirm appointment slot", priority: "high", status: "assigned" },
  { text: "Send invoice copy", priority: "medium", status: "open" },
  { text: "Offer upgrade discount", priority: "low", status: "completed" },
];

const broadcastSeeds = [
  {
    title: "Weekly Tips",
    message: "Here are this week's top tips for better results.",
    status: "sent",
  },
  {
    title: "New Package Launch",
    message: "We launched a new premium package with added benefits.",
    status: "scheduled",
  },
  {
    title: "Weekend Offer",
    message: "Book this weekend and get a special discount.",
    status: "draft",
  },
  {
    title: "Service Update",
    message: "We have expanded our service hours for your convenience.",
    status: "sent",
  },
  {
    title: "Feedback Request",
    message: "We value your feedback. Share your experience.",
    status: "failed",
  },
];

const templateSeeds = [
  {
    name: "Welcome Message",
    category: "onboarding",
    content: "Welcome to AlgoAura! Let us know how we can help.",
    variables_json: '["name"]',
  },
  {
    name: "Follow-up Reminder",
    category: "followup",
    content: "Just checking in. Do you want to proceed with the next step?",
    variables_json: '["name","service"]',
  },
  {
    name: "Payment Link",
    category: "billing",
    content: "Here is your payment link: {{link}}",
    variables_json: '["link"]',
  },
  {
    name: "Appointment Confirmed",
    category: "appointments",
    content: "Your appointment is confirmed for {{date}} at {{time}}.",
    variables_json: '["date","time"]',
  },
  {
    name: "Request Feedback",
    category: "feedback",
    content: "How was your experience? We would love your feedback.",
    variables_json: "[]",
  },
  {
    name: "Service Update",
    category: "updates",
    content: "We have updated our service catalog. Check it out.",
    variables_json: "[]",
  },
];

const catalogSeeds = [
  {
    item_type: "service",
    name: "Initial Consultation",
    category: "consultation",
    description: "One-on-one session to understand customer needs.",
    price_label: "USD 49",
    duration_minutes: 45,
    is_bookable: true,
  },
  {
    item_type: "service",
    name: "Premium Consultation",
    category: "consultation",
    description: "Deep dive session with personalized guidance.",
    price_label: "USD 99",
    duration_minutes: 90,
    is_bookable: true,
  },
  {
    item_type: "service",
    name: "Follow-up Session",
    category: "support",
    description: "Progress check-in with actionable next steps.",
    price_label: "USD 39",
    duration_minutes: 30,
    is_bookable: true,
  },
  {
    item_type: "product",
    name: "Starter Kit",
    category: "merchandise",
    description: "Printed material and starter guidance pack.",
    price_label: "USD 25",
    duration_minutes: null,
    is_bookable: false,
  },
  {
    item_type: "product",
    name: "Premium Guide",
    category: "digital",
    description: "Downloadable guide with advanced tips.",
    price_label: "USD 15",
    duration_minutes: null,
    is_bookable: false,
  },
  {
    item_type: "product",
    name: "Gift Voucher",
    category: "voucher",
    description: "Voucher for gifting services to friends.",
    price_label: "USD 50",
    duration_minutes: null,
    is_bookable: false,
  },
  {
    item_type: "service",
    name: "Group Workshop",
    category: "workshop",
    description: "Interactive workshop for small groups.",
    price_label: "USD 199",
    duration_minutes: 120,
    is_bookable: true,
  },
  {
    item_type: "service",
    name: "Express Session",
    category: "consultation",
    description: "Quick 20-minute consult for urgent needs.",
    price_label: "USD 29",
    duration_minutes: 20,
    is_bookable: true,
  },
  {
    item_type: "product",
    name: "Monthly Planner",
    category: "stationery",
    description: "Planner to track goals and sessions.",
    price_label: "USD 12",
    duration_minutes: null,
    is_bookable: false,
  },
  {
    item_type: "service",
    name: "VIP Package",
    category: "premium",
    description: "Priority support with extended sessions.",
    price_label: "USD 249",
    duration_minutes: 120,
    is_bookable: true,
  },
];

async function getCount(client, table) {
  const { rows } = await client.query(`SELECT COUNT(*) AS count FROM ${table}`);
  return Number(rows?.[0]?.count || 0);
}

function addDays(base, days, hours = 10) {
  const date = new Date(base.getTime());
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date;
}

async function seedDatabase() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required for seeding.");
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  const inserted = {};
  const mark = (key) => {
    inserted[key] = (inserted[key] || 0) + 1;
  };

  try {
    const existingAdmins = await client.query(
      "SELECT id, phone, email, profession FROM admin_accounts ORDER BY id"
    );
    const adminPhones = new Set(existingAdmins.rows.map((row) => row.phone));
    const adminsNeeded = Math.max(0, TARGETS.admins - existingAdmins.rows.length);
    const adminToInsert = adminSeeds
      .filter((admin) => !adminPhones.has(admin.phone))
      .slice(0, adminsNeeded);

    for (const admin of adminToInsert) {
      await client.query(
        `
        INSERT INTO admin_accounts
          (name, phone, email, password_hash, admin_tier, status, profession, whatsapp_number, whatsapp_name)
        VALUES ($1, $2, $3, $4, 'client_admin', 'active', $5, $6, $7)
        ON CONFLICT (phone) DO NOTHING
        `,
        [
          admin.name,
          admin.phone,
          admin.email,
          hashPassword("Password@123"),
          admin.profession,
          admin.phone,
          admin.whatsapp_name,
        ]
      );
      mark("admins");
    }

    const { rows: admins } = await client.query(
      "SELECT id, name, profession FROM admin_accounts ORDER BY id"
    );
    if (!admins.length) {
      throw new Error("No admins found for seeding.");
    }

    const usersCount = await getCount(client, "users");
    const usersNeeded = Math.max(0, TARGETS.users - usersCount);
    const existingUsers = await client.query("SELECT phone FROM users");
    const userPhones = new Set(existingUsers.rows.map((row) => row.phone));
    const usersToInsert = userSeeds
      .filter((user) => !userPhones.has(user.phone))
      .slice(0, usersNeeded);

    for (let i = 0; i < usersToInsert.length; i += 1) {
      const user = usersToInsert[i];
      const admin = admins[i % admins.length];
      await client.query(
        `
        INSERT INTO users (phone, name, email, assigned_admin_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (phone) DO NOTHING
        `,
        [user.phone, user.name, user.email, admin.id]
      );
      mark("users");
    }

    const { rows: users } = await client.query(
      "SELECT id, name, assigned_admin_id FROM users ORDER BY id"
    );
    if (!users.length) {
      throw new Error("No users found for seeding.");
    }

    const messagesCount = await getCount(client, "messages");
    const messagesNeeded = Math.max(0, TARGETS.messages - messagesCount);
    let messagesInserted = 0;
    for (let i = 0; i < messageSeeds.length && messagesInserted < messagesNeeded; i += 1) {
      const seed = messageSeeds[i];
      const user = users[i % users.length];
      const admin =
        admins.find((row) => row.id === user.assigned_admin_id) ||
        admins[i % admins.length];
      const { rowCount } = await client.query(
        "SELECT 1 FROM messages WHERE user_id = $1 AND message_text = $2 LIMIT 1",
        [user.id, seed.text]
      );
      if (rowCount === 0) {
        await client.query(
          `
          INSERT INTO messages (user_id, admin_id, message_text, message_type, status, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW() - ($6 || ' hours')::interval)
          `,
          [user.id, admin.id, seed.text, seed.type, seed.status, i + 1]
        );
        messagesInserted += 1;
        mark("messages");
      }
    }

    const { rows: messageCounts } = await client.query(
      "SELECT user_id, COUNT(*)::int AS count FROM messages GROUP BY user_id"
    );
    const messageByUser = new Map(
      messageCounts.map((row) => [row.user_id, row.count])
    );
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];
      const count = messageByUser.get(user.id) || 0;
      if (count >= 2) continue;
      const admin =
        admins.find((row) => row.id === user.assigned_admin_id) ||
        admins[i % admins.length];
      const incomingText = `Hi ${admin?.name || "there"}, I have a quick question.`;
      const outgoingText = `Sure! I can help you with that.`;
      await client.query(
        `
        INSERT INTO messages (user_id, admin_id, message_text, message_type, status, created_at)
        VALUES ($1, $2, $3, 'incoming', 'read', NOW() - '2 hours'::interval),
               ($1, $2, $4, 'outgoing', 'delivered', NOW() - '1 hours'::interval)
        `,
        [user.id, admin.id, incomingText, outgoingText]
      );
      mark("messages");
    }

    const reqCount = await getCount(client, "user_requirements");
    const reqNeeded = Math.max(0, TARGETS.requirements - reqCount);
    let reqInserted = 0;
    for (let i = 0; i < requirementSeeds.length && reqInserted < reqNeeded; i += 1) {
      const seed = requirementSeeds[i];
      const user = users[i % users.length];
      const { rowCount } = await client.query(
        "SELECT 1 FROM user_requirements WHERE user_id = $1 AND requirement_text = $2 LIMIT 1",
        [user.id, seed.text]
      );
      if (rowCount === 0) {
        await client.query(
          `
          INSERT INTO user_requirements (user_id, requirement_text, category, status)
          VALUES ($1, $2, $3, $4)
          `,
          [user.id, seed.text, seed.category, seed.status]
        );
        reqInserted += 1;
        mark("requirements");
      }
    }

    const appointmentCount = await getCount(client, "appointments");
    const appointmentNeeded = Math.max(0, TARGETS.appointments - appointmentCount);
    const base = new Date();
    let appointmentInserted = 0;
    for (let i = 0; i < appointmentNeeded; i += 1) {
      const user = users[i % users.length];
      const admin =
        admins.find((row) => row.id === user.assigned_admin_id) ||
        admins[i % admins.length];
      const start = addDays(base, i + 1, 11);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await client.query(
        `
        INSERT INTO appointments
          (user_id, admin_id, profession, appointment_type, start_time, end_time, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (admin_id, start_time) DO NOTHING
        `,
        [
          user.id,
          admin.id,
          admin.profession,
          "consultation",
          start.toISOString(),
          end.toISOString(),
          i % 3 === 0 ? "completed" : "booked",
        ]
      );
      appointmentInserted += 1;
      mark("appointments");
    }

    const { rows: appointmentCounts } = await client.query(
      "SELECT admin_id, COUNT(*)::int AS count FROM appointments GROUP BY admin_id"
    );
    const appointmentsByAdmin = new Map(
      appointmentCounts.map((row) => [row.admin_id, row.count])
    );
    for (let i = 0; i < admins.length; i += 1) {
      const admin = admins[i];
      const count = appointmentsByAdmin.get(admin.id) || 0;
      if (count > 0) continue;
      const user =
        users.find((row) => row.assigned_admin_id === admin.id) || users[i % users.length];
      const start = addDays(base, i + 2, 15);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await client.query(
        `
        INSERT INTO appointments
          (user_id, admin_id, profession, appointment_type, start_time, end_time, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (admin_id, start_time) DO NOTHING
        `,
        [
          user.id,
          admin.id,
          admin.profession,
          "consultation",
          start.toISOString(),
          end.toISOString(),
          "booked",
        ]
      );
      mark("appointments");
    }

    const needsCount = await getCount(client, "user_needs");
    const needsNeeded = Math.max(0, TARGETS.needs - needsCount);
    let needsInserted = 0;
    for (let i = 0; i < needSeeds.length && needsInserted < needsNeeded; i += 1) {
      const seed = needSeeds[i];
      const user = users[i % users.length];
      const admin = admins[i % admins.length];
      const { rowCount } = await client.query(
        "SELECT 1 FROM user_needs WHERE user_id = $1 AND need_text = $2 LIMIT 1",
        [user.id, seed.text]
      );
      if (rowCount === 0) {
        await client.query(
          `
          INSERT INTO user_needs (user_id, need_text, priority, status, assigned_to)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [user.id, seed.text, seed.priority, seed.status, admin.id]
        );
        needsInserted += 1;
        mark("needs");
      }
    }

    const broadcastCount = await getCount(client, "broadcasts");
    const broadcastNeeded = Math.max(0, TARGETS.broadcasts - broadcastCount);
    let broadcastInserted = 0;
    for (let i = 0; i < broadcastSeeds.length && broadcastInserted < broadcastNeeded; i += 1) {
      const seed = broadcastSeeds[i];
      const admin = admins[i % admins.length];
      const { rowCount } = await client.query(
        "SELECT 1 FROM broadcasts WHERE title = $1 LIMIT 1",
        [seed.title]
      );
      if (rowCount === 0) {
        const scheduled =
          seed.status === "scheduled"
            ? addDays(base, 2, 15).toISOString()
            : null;
        await client.query(
          `
          INSERT INTO broadcasts
            (title, message, target_audience_type, scheduled_at, status, sent_count, delivered_count, created_by)
          VALUES ($1, $2, 'all', $3, $4, $5, $6, $7)
          `,
          [
            seed.title,
            seed.message,
            scheduled,
            seed.status,
            seed.status === "sent" ? 120 : 0,
            seed.status === "sent" ? 110 : 0,
            admin.id,
          ]
        );
        broadcastInserted += 1;
        mark("broadcasts");
      }
    }

    const templateCount = await getCount(client, "message_templates");
    const templateNeeded = Math.max(0, TARGETS.templates - templateCount);
    let templateInserted = 0;
    for (let i = 0; i < templateSeeds.length && templateInserted < templateNeeded; i += 1) {
      const seed = templateSeeds[i];
      const admin = admins[i % admins.length];
      const { rowCount } = await client.query(
        "SELECT 1 FROM message_templates WHERE name = $1 LIMIT 1",
        [seed.name]
      );
      if (rowCount === 0) {
        await client.query(
          `
          INSERT INTO message_templates (name, category, content, variables_json, created_by)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [seed.name, seed.category, seed.content, seed.variables_json, admin.id]
        );
        templateInserted += 1;
        mark("templates");
      }
    }

    const catalogCount = await getCount(client, "admin_catalog_items");
    const catalogNeeded = Math.max(0, TARGETS.catalog - catalogCount);
    let catalogInserted = 0;
    for (let i = 0; i < catalogSeeds.length && catalogInserted < catalogNeeded; i += 1) {
      const seed = catalogSeeds[i];
      const admin = admins[i % admins.length];
      const { rowCount } = await client.query(
        "SELECT 1 FROM admin_catalog_items WHERE admin_id = $1 AND name = $2 LIMIT 1",
        [admin.id, seed.name]
      );
      if (rowCount === 0) {
        await client.query(
          `
          INSERT INTO admin_catalog_items
            (admin_id, item_type, name, category, description, price_label, duration_minutes, is_bookable)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            admin.id,
            seed.item_type,
            seed.name,
            seed.category,
            seed.description,
            seed.price_label,
            seed.duration_minutes,
            seed.is_bookable,
          ]
        );
        catalogInserted += 1;
        mark("catalog");
      }
    }

    const { rows: catalogCounts } = await client.query(
      "SELECT admin_id, item_type, COUNT(*)::int AS count FROM admin_catalog_items GROUP BY admin_id, item_type"
    );
    const catalogByAdminType = new Map(
      catalogCounts.map((row) => [`${row.admin_id}:${row.item_type}`, row.count])
    );
    for (let i = 0; i < admins.length; i += 1) {
      const admin = admins[i];
      const hasService = (catalogByAdminType.get(`${admin.id}:service`) || 0) > 0;
      const hasProduct = (catalogByAdminType.get(`${admin.id}:product`) || 0) > 0;

      if (!hasService) {
        await client.query(
          `
          INSERT INTO admin_catalog_items
            (admin_id, item_type, name, category, description, price_label, duration_minutes, is_bookable)
          VALUES ($1, 'service', $2, $3, $4, $5, $6, true)
          `,
          [
            admin.id,
            `${admin.profession || "Premium"} Consultation`,
            "consultation",
            "Professional consultation tailored to your needs.",
            "USD 79",
            60,
          ]
        );
        mark("catalog");
      }

      if (!hasProduct) {
        await client.query(
          `
          INSERT INTO admin_catalog_items
            (admin_id, item_type, name, category, description, price_label, duration_minutes, is_bookable)
          VALUES ($1, 'product', $2, $3, $4, $5, NULL, false)
          `,
          [
            admin.id,
            `${admin.profession || "Essential"} Starter Pack`,
            "starter",
            "Starter pack with curated resources.",
            "USD 29",
          ]
        );
        mark("catalog");
      }
    }

    console.log("✅ Seed complete.", inserted);
  } finally {
    await client.end();
  }
}

console.log("🚀 Initializing database...");
initDatabase()
  .then(async () => {
    console.log("✅ Database initialized. Seeding dummy data...");
    await seedDatabase();
    console.log("✅ Dummy data seeded. Ready to start the app...");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to initialize/seed:", err.message);
    process.exit(1);
  });
