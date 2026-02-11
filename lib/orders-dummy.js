const ORDER_SEEDS = [
  {
    order_number: "WA-1001",
    customer_name: "Aarav Rao",
    customer_phone: "+91 91000 00001",
    customer_email: "aarav@example.com",
    channel: "WhatsApp",
    status: "new",
    payment_status: "pending",
    fulfillment_status: "unfulfilled",
    delivery_method: "Delivery",
    delivery_address: "12 MG Road, Bengaluru, Karnataka",
    age_days: 1,
    age_hours: 2,
    items: [
      { name: "Premium Consultation", quantity: 1, price: 1299 },
      { name: "Starter Kit", quantity: 1, price: 499 },
    ],
    notes: [
      { message: "Customer asked for evening slot.", author: "Sales Team", offset_hours: 1 },
    ],
  },
  {
    order_number: "WA-1002",
    customer_name: "Diya Sen",
    customer_phone: "+91 91000 00002",
    customer_email: "diya@example.com",
    channel: "WhatsApp",
    status: "confirmed",
    payment_status: "paid",
    fulfillment_status: "packed",
    delivery_method: "Pickup",
    delivery_address: "Pickup at Koramangala Outlet",
    age_days: 2,
    age_hours: 4,
    items: [
      { name: "Monthly Planner", quantity: 2, price: 249 },
      { name: "Premium Guide", quantity: 1, price: 299 },
    ],
    notes: [
      { message: "Pickup scheduled for tomorrow 5 PM.", author: "Ops", offset_hours: 5 },
    ],
  },
  {
    order_number: "WA-1003",
    customer_name: "Kabir Joshi",
    customer_phone: "+91 91000 00003",
    customer_email: "kabir@example.com",
    channel: "WhatsApp",
    status: "processing",
    payment_status: "paid",
    fulfillment_status: "packed",
    delivery_method: "Delivery",
    delivery_address: "Plot 8, Sector 21, Gurugram",
    age_days: 4,
    age_hours: 3,
    items: [
      { name: "Group Workshop", quantity: 1, price: 2499 },
    ],
    notes: [
      { message: "Assign senior agent for workshop prep.", author: "Manager", offset_hours: 10 },
      { message: "Follow-up call planned.", author: "Support", offset_hours: 12 },
    ],
  },
  {
    order_number: "WA-1004",
    customer_name: "Nisha Verma",
    customer_phone: "+91 91000 00004",
    customer_email: "nisha@example.com",
    channel: "WhatsApp",
    status: "out_for_delivery",
    payment_status: "paid",
    fulfillment_status: "shipped",
    delivery_method: "Delivery",
    delivery_address: "24 Green Park, New Delhi",
    age_days: 5,
    age_hours: 7,
    items: [
      { name: "Gift Voucher", quantity: 1, price: 1500 },
      { name: "Starter Kit", quantity: 1, price: 499 },
    ],
    notes: [
      { message: "Courier ID: BLR-9912", author: "Logistics", offset_hours: 8 },
    ],
  },
  {
    order_number: "WA-1005",
    customer_name: "Ritika Das",
    customer_phone: "+91 91000 00005",
    customer_email: "ritika@example.com",
    channel: "WhatsApp",
    status: "fulfilled",
    payment_status: "paid",
    fulfillment_status: "delivered",
    delivery_method: "Delivery",
    delivery_address: "88 Lake View, Pune",
    age_days: 7,
    age_hours: 5,
    items: [
      { name: "Express Session", quantity: 1, price: 699 },
      { name: "Premium Guide", quantity: 1, price: 299 },
    ],
    notes: [
      { message: "Delivered successfully.", author: "System", offset_hours: 1 },
    ],
  },
  {
    order_number: "WA-1006",
    customer_name: "Ishaan Kapoor",
    customer_phone: "+91 91000 00006",
    customer_email: "ishaan@example.com",
    channel: "WhatsApp",
    status: "cancelled",
    payment_status: "refunded",
    fulfillment_status: "cancelled",
    delivery_method: "Delivery",
    delivery_address: "7/11 Heritage Street, Jaipur",
    age_days: 10,
    age_hours: 2,
    items: [
      { name: "VIP Package", quantity: 1, price: 5999 },
    ],
    notes: [
      { message: "Customer cancelled due to schedule conflict.", author: "Support", offset_hours: 3 },
    ],
  },
  {
    order_number: "WA-1007",
    customer_name: "Maya Singh",
    customer_phone: "+91 91000 00007",
    customer_email: "maya@example.com",
    channel: "WhatsApp",
    status: "packed",
    payment_status: "paid",
    fulfillment_status: "packed",
    delivery_method: "Delivery",
    delivery_address: "45 Orchard Road, Mumbai",
    age_days: 3,
    age_hours: 1,
    items: [
      { name: "Starter Kit", quantity: 2, price: 499 },
      { name: "Monthly Planner", quantity: 1, price: 249 },
    ],
    notes: [
      { message: "Packing completed. Awaiting pickup.", author: "Ops", offset_hours: 2 },
    ],
  },
  {
    order_number: "WA-1008",
    customer_name: "Ravi Kumar",
    customer_phone: "+91 91000 00008",
    customer_email: "ravi@example.com",
    channel: "WhatsApp",
    status: "new",
    payment_status: "pending",
    fulfillment_status: "unfulfilled",
    delivery_method: "Delivery",
    delivery_address: "19 Sunrise Avenue, Hyderabad",
    age_days: 0,
    age_hours: 6,
    items: [
      { name: "Initial Consultation", quantity: 1, price: 999 },
    ],
    notes: [],
  },
  {
    order_number: "WA-1009",
    customer_name: "Sara Ali",
    customer_phone: "+91 91000 00009",
    customer_email: "sara@example.com",
    channel: "WhatsApp",
    status: "confirmed",
    payment_status: "paid",
    fulfillment_status: "unfulfilled",
    delivery_method: "Delivery",
    delivery_address: "65 Palm Grove, Chennai",
    age_days: 6,
    age_hours: 4,
    items: [
      { name: "Premium Consultation", quantity: 1, price: 1499 },
      { name: "Premium Guide", quantity: 1, price: 299 },
    ],
    notes: [
      { message: "Payment received, preparing schedule.", author: "Finance", offset_hours: 6 },
    ],
  },
];

const buildDate = (now, days, hours) => {
  const date = new Date(now.getTime());
  date.setDate(date.getDate() - Number(days || 0));
  date.setHours(date.getHours() - Number(hours || 0));
  return date;
};

const computeTotal = (items = []) =>
  items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

export const getDummyOrders = (adminId) => {
  const now = new Date();
  return ORDER_SEEDS.map((seed, index) => {
    const createdAt = buildDate(now, seed.age_days, seed.age_hours);
    const notes = (seed.notes || []).map((note, idx) => ({
      id: `${seed.order_number}-note-${idx + 1}`,
      message: note.message,
      author: note.author,
      created_at: buildDate(createdAt, 0, note.offset_hours || 0).toISOString(),
    }));
    const items = seed.items || [];
    return {
      id: `${adminId || "demo"}-${seed.order_number}-${index + 1}`,
      admin_id: adminId || null,
      order_number: seed.order_number,
      customer_name: seed.customer_name,
      customer_phone: seed.customer_phone,
      customer_email: seed.customer_email,
      channel: seed.channel,
      status: seed.status,
      payment_status: seed.payment_status,
      fulfillment_status: seed.fulfillment_status,
      delivery_method: seed.delivery_method,
      delivery_address: seed.delivery_address,
      currency: "INR",
      total_amount: computeTotal(items),
      items,
      notes,
      assigned_to: adminId ? `Admin #${adminId}` : "Admin Team",
      created_at: createdAt.toISOString(),
      placed_at: createdAt.toISOString(),
    };
  });
};
