import { query, queryOne } from "@/lib/db";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  qty: number;
}

export interface Order {
  id: string;
  channel: "international_card" | "local_whatsapp" | "custom_deposit";
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  stripeSessionId: string | null;
  paystackReference: string | null;
  status: "pending" | "paid" | "failed";
  createdAt: string;
}

interface OrderRow {
  id: string;
  channel: Order["channel"];
  items: OrderItem[];
  subtotal: string;
  shipping_fee: string;
  total: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: Order["shippingAddress"];
  stripe_session_id: string | null;
  paystack_reference: string | null;
  status: Order["status"];
  created_at: string;
}

function fromRow(r: OrderRow): Order {
  return {
    id: r.id,
    channel: r.channel,
    items: r.items,
    subtotal: Number(r.subtotal),
    shippingFee: Number(r.shipping_fee),
    total: Number(r.total),
    customerEmail: r.customer_email,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    shippingAddress: r.shipping_address,
    stripeSessionId: r.stripe_session_id,
    paystackReference: r.paystack_reference,
    status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function listOrders(): Promise<Order[]> {
  const rows = await query<OrderRow>(`SELECT * FROM orders ORDER BY created_at DESC`);
  return rows.map(fromRow);
}

export async function addOrder(input: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const id = `order_${Date.now()}`;
  const row = await queryOne<OrderRow>(
    `INSERT INTO orders (id, channel, items, subtotal, shipping_fee, total, customer_email, customer_name, customer_phone, shipping_address, stripe_session_id, paystack_reference, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      id,
      input.channel,
      JSON.stringify(input.items),
      input.subtotal,
      input.shippingFee,
      input.total,
      input.customerEmail,
      input.customerName,
      input.customerPhone,
      input.shippingAddress ? JSON.stringify(input.shippingAddress) : null,
      input.stripeSessionId,
      input.paystackReference,
      input.status,
    ]
  );
  return fromRow(row!);
}

export async function getOrderByPaystackReference(reference: string): Promise<Order | null> {
  const row = await queryOne<OrderRow>(`SELECT * FROM orders WHERE paystack_reference = $1`, [reference]);
  return row ? fromRow(row) : null;
}

export async function updateOrderByStripeSession(sessionId: string, patch: Partial<Order>): Promise<Order | null> {
  return updateOrderByField("stripe_session_id", sessionId, patch);
}

export async function updateOrderByPaystackReference(reference: string, patch: Partial<Order>): Promise<Order | null> {
  return updateOrderByField("paystack_reference", reference, patch);
}

async function updateOrderByField(field: "stripe_session_id" | "paystack_reference", value: string, patch: Partial<Order>): Promise<Order | null> {
  // Only status is realistically patched from a webhook today — keep this
  // narrow and explicit rather than building a generic dynamic SET clause.
  if (patch.status === undefined) return null;
  const row = await queryOne<OrderRow>(
    `UPDATE orders SET status = $1 WHERE ${field} = $2 RETURNING *`,
    [patch.status, value]
  );
  return row ? fromRow(row) : null;
}
