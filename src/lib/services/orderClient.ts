import type { Order, PaymentProof } from "$lib/types";

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
  paymentProofFile?: File;
}

export async function createOrder(
  orderData: Omit<OrderCreationData, "orderItems"> & {
    orderItems?: OrderCreationData["orderItems"];
    paymentProofFile?: File;
  },
): Promise<Order> {
  // Use multipart endpoint to handle file uploads along with order data
  const formData = new FormData();
  
  // Add basic order data
  formData.append('userId', orderData.userId.toString());
  if (orderData.status) formData.append('status', orderData.status);
  formData.append('shippingMethod', orderData.shippingMethod);
  formData.append('paymentMethod', orderData.paymentMethod);
  formData.append('totalAmount', orderData.totalAmount.toString());
  if (orderData.notes) formData.append('notes', orderData.notes);
  if (orderData.createdById) formData.append('createdById', orderData.createdById.toString());
  
  // Add order items as JSON string
  if (orderData.orderItems) {
    formData.append('orderItems', JSON.stringify(orderData.orderItems));
  }
  
  // Add payment proof file if provided and payment method is transfer or qris
  if (orderData.paymentProofFile instanceof File && (orderData.paymentMethod === 'transfer' || orderData.paymentMethod === 'qris')) {
    formData.append('paymentProofFile', orderData.paymentProofFile);
  }

  const res = await fetch("/api/orders/multipart", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create order");
  }

  const result: Order = await res.json();
  return result;
}

// Separately handle payment proof file upload
export async function uploadPaymentProof(paymentId: number, file: File): Promise<{ message: string; paymentProof: PaymentProof }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('paymentId', paymentId.toString());
  
  const res = await fetch('/api/payment-proofs', {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to upload payment proof");
  }
  
  const result: { message: string; paymentProof: PaymentProof } = await res.json();
  return result;
}

export async function updateOrder(
  id: number,
  orderData: Partial<OrderUpdateData>,
): Promise<Order> {
  // Check if payment proof file is being included
  if (orderData.paymentProofFile instanceof File) {
    // Use multipart endpoint to handle file uploads along with order data
    const formData = new FormData();
    
    // Add all data fields
    if (orderData.userId) formData.append('userId', orderData.userId.toString());
    if (orderData.orderNumber) formData.append('orderNumber', orderData.orderNumber);
    if (orderData.status) formData.append('status', orderData.status);
    if (orderData.shippingMethod) formData.append('shippingMethod', orderData.shippingMethod);
    if (orderData.paymentMethod) formData.append('paymentMethod', orderData.paymentMethod);
    if (orderData.paymentStatus) formData.append('paymentStatus', orderData.paymentStatus);
    if (orderData.totalAmount) formData.append('totalAmount', orderData.totalAmount.toString());
    if (orderData.notes !== undefined) formData.append('notes', orderData.notes);
    if (orderData.createdById) formData.append('createdById', orderData.createdById.toString());
    
    // Add order items as JSON string if provided
    if (orderData.orderItems) {
      formData.append('orderItems', JSON.stringify(orderData.orderItems));
    }
    
    // Add payment proof file
    formData.append('paymentProofFile', orderData.paymentProofFile);

    const res = await fetch(`/api/orders/${id}/multipart`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update order");
    }

    const result: Order = await res.json();
    return result;
  } else {
    // Use regular JSON endpoint for orders without file uploads
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update order");
    }

    const result: Order = await res.json();
    return result;
  }
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

  const result: Order = await res.json();
  return result;
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

  const result: Order[] = await res.json();
  return result;
}
