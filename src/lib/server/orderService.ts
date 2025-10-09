import prisma from "$lib/server/prisma";

const orderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  shippingMethod: true,
  // shippingAddress: true, // Field removed from schema
  paymentMethod: true,
  paymentStatus: true,
  totalAmount: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  createdById: true,
  // Relations
  user: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
  orderItems: {
    select: {
      id: true,
      qty: true,
      price: true,
      subtotal: true,
      productId: true,
      variantId: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      variant: {
        select: {
          id: true,
          variantName: true,
        },
      },
    },
  },
};

export async function getAllOrders() {
  return prisma.order.findMany({
    select: orderSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    select: orderSelect,
  });
}

export async function createOrder({
  userId,
  createdById,
  orderNumber,
  status,
  shippingMethod,
  paymentMethod,
  totalAmount,
  notes,
  orderItems,
}: {
  userId: number;
  createdById?: number;
  orderNumber: string;
  status?: "pending" | "processing" | "finished" | "canceled";
  shippingMethod: "pickup" | "delivery";
  paymentMethod: "transfer" | "qris" | "cash";
  totalAmount: number;
  notes?: string;
  orderItems: {
    productId: number;
    variantId?: number;
    qty: number;
    price: number;
    subtotal: number;
  }[];
}) {
  return prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        createdById,
        orderNumber,
        status: status || "pending",
        shippingMethod,
        paymentMethod,
        totalAmount,
        notes: notes || null,
        orderItems: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            qty: item.qty,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
      },
      select: orderSelect,
    });

    return newOrder;
  });
}

export async function updateOrder(
  id: number,
  {
    userId,
    createdById,
    orderNumber,
    status,
    shippingMethod,
    paymentMethod,
    paymentStatus,
    totalAmount,
    notes,
    orderItems,
  }: {
    userId?: number;
    createdById?: number;
    orderNumber?: string;
    status?: "pending" | "processing" | "finished" | "canceled";
    shippingMethod?: "pickup" | "delivery";
    paymentMethod?: "transfer" | "qris" | "cash";
    paymentStatus?: "pending" | "confirmed" | "failed" | "refunded";
    totalAmount?: number;
    notes?: string;
    orderItems?: {
      id?: number;
      productId: number;
      variantId?: number;
      qty: number;
      price: number;
      subtotal: number;
    }[];
  },
) {
  return prisma.$transaction(async (tx) => {
    const data: {
      userId?: number;
      createdById?: number;
      orderNumber?: string;
      status?: "pending" | "processing" | "finished" | "canceled";
      shippingMethod?: "pickup" | "delivery";
      paymentMethod?: "transfer" | "qris" | "cash";
      paymentStatus?: "pending" | "confirmed" | "failed" | "refunded";
      totalAmount?: number;
      notes?: string;
    } = {};

    if (userId) data.userId = userId;
    if (createdById) data.createdById = createdById;
    if (orderNumber) data.orderNumber = orderNumber;
    if (status) data.status = status;
    if (shippingMethod) data.shippingMethod = shippingMethod;
    if (paymentMethod) data.paymentMethod = paymentMethod;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (totalAmount) data.totalAmount = totalAmount;
    if (notes !== undefined) data.notes = notes;

    // Update the order
    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        ...data,
        // Update order items if provided
        ...(orderItems && {
          orderItems: {
            deleteMany: { orderId: id },
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              qty: item.qty,
              price: item.price,
              subtotal: item.subtotal,
            })),
          },
        }),
      },
      select: orderSelect,
    });

    return updatedOrder;
  });
}

export async function deleteOrder(id: number) {
  return prisma.order.delete({
    where: { id },
  });
}

export async function getOrderByOrderNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    select: orderSelect,
  });
}

export async function getOrdersByUserId(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    select: orderSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getNextOrderNumberForToday() {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `ORD-${year}${month}${day}`;
  
  // Find the highest order number with today's prefix
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: datePrefix
      }
    },
    orderBy: {
      orderNumber: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastOrder) {
    // Extract the number part after the date (e.g., from ORD-251008-0005 get 0005)
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }
  
  return `${datePrefix}-${String(nextNumber).padStart(4, '0')}`;
}
