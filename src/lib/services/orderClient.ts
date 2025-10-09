import type { Order } from "$lib/types";

// Define types for order creation (with required fields)
interface OrderCreationData {
  userId: number; // Required for creation
  status?: string;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus?: string;
  totalAmount: number;
  notes?: string;
  orderItems?: Array<{
    productId: number;
    variantId?: number;
    qty: number;
    price: number;
    subtotal: number;
  }>;
  createdById?: number | null;
}

// Define types for order update (with optional fields)
interface OrderUpdateData {
  userId?: number;
  orderNumber?: string;
  status?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount?: number;
  notes?: string;
  orderItems?: Array<{
    id?: number;
    productId: number;
    variantId?: number;
    qty: number;
    price: number;
    subtotal: number;
  }>;
  createdById?: number | null;
}

export async function createOrder(
  orderData: Omit<OrderCreationData, "orderItems"> & {
    orderItems?: OrderCreationData["orderItems"];
  },
): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create order");
  }

  return (await res.json()) as Order;
}

export async function updateOrder(
  id: number,
  orderData: Partial<OrderUpdateData>,
): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update order");
  }

  return (await res.json()) as Order;
}

export async function deleteOrder(id: number): Promise<boolean> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "DELETE",
  });

  return res.ok;
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch order");
  }

  return (await res.json()) as Order;
}

export async function getNextOrderNumber(): Promise<string> {
  const res = await fetch("/api/orders/next-number");

  if (!res.ok) {
    throw new Error("Failed to fetch next order number");
  }

  const data = await res.json();
  return data.orderNumber as string;
}

export async function getAllOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return (await res.json()) as Order[];
}
