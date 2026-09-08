export type ProductCategory = "template" | "service" | "saas" | "api" | "fullstack";

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  shortDescription: string;
  longDescription: string;
  price: number;
  currency: string;
  thumbnail: string;
  images: string[];
  demoUrl: string;
  /** Seeded accounts a visitor can use on the live demo. */
  demoLogin?: { role: string; email: string; password: string }[];
  techStack: string[];
  features: string[];
  deliverables: string[];
  status: "active" | "draft" | "archived";
  featured: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "delivered" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  buyerEmail: string;
  buyerName: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentRef?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutFormData {
  buyerName: string;
  buyerEmail: string;
  notes?: string;
}
