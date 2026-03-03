import { Order, OrderItem } from "@/types/shop";

// In-memory store for development / demo.
// In production, replace with database (Prisma + PostgreSQL).
const orders: Order[] = [
  {
    id: "demo-001",
    orderNumber: "ORD-2026-0001",
    buyerEmail: "demo@example.com",
    buyerName: "Demo Customer",
    status: "delivered",
    items: [{ productId: "portfolio-template", title: "Portfolio Website Template", price: 4900, quantity: 1 }],
    totalAmount: 4900,
    currency: "THB",
    paymentMethod: "promptpay",
    paymentRef: "PP-2026-001",
    notes: "Demo order",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-002",
    orderNumber: "ORD-2026-0002",
    buyerEmail: "buyer2@example.com",
    buyerName: "Test Buyer",
    status: "paid",
    items: [{ productId: "admin-dashboard", title: "SaaS Admin Dashboard", price: 9900, quantity: 1 }],
    totalAmount: 9900,
    currency: "THB",
    paymentMethod: "promptpay",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-003",
    orderNumber: "ORD-2026-0003",
    buyerEmail: "startup@company.com",
    buyerName: "Startup Co.",
    status: "pending",
    items: [{ productId: "ecommerce-suite", title: "E-Commerce Management Suite", price: 24900, quantity: 1 }],
    totalAmount: 24900,
    currency: "THB",
    paymentMethod: "promptpay",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export function getAllOrders(): Order[] {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(data: {
  buyerEmail: string;
  buyerName: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
}): Order {
  const order: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, "0")}`,
    buyerEmail: data.buyerEmail,
    buyerName: data.buyerName,
    status: "pending",
    items: data.items,
    totalAmount: data.totalAmount,
    currency: "THB",
    paymentMethod: "promptpay",
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function updateOrderStatus(
  id: string,
  status: Order["status"],
  paymentRef?: string
): Order | null {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (paymentRef) order.paymentRef = paymentRef;
  return order;
}

export function getOrderStats() {
  const total = orders.reduce((s, o) => s + (o.status !== "cancelled" ? o.totalAmount : 0), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const paid = orders.filter((o) => o.status === "paid").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  return { total, pending, paid, delivered, count: orders.length };
}
