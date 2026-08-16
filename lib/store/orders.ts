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
  channel: "international_card" | "local_whatsapp";
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  customerEmail: string | null;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  stripeSessionId: string | null;
  status: "pending" | "paid" | "failed";
  createdAt: string;
}

const ORDERS: Order[] = [];

export function listOrders(): Order[] {
  return [...ORDERS].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addOrder(input: Omit<Order, "id" | "createdAt">): Order {
  const order: Order = { ...input, id: `order_${Date.now()}`, createdAt: new Date().toISOString() };
  ORDERS.push(order);
  return order;
}

export function updateOrderByStripeSession(sessionId: string, patch: Partial<Order>): Order | null {
  const order = ORDERS.find((o) => o.stripeSessionId === sessionId);
  if (!order) return null;
  Object.assign(order, patch);
  return order;
}
