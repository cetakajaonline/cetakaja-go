import prisma from "$lib/server/prisma";
import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from "@prisma/client";

const orderSelect = {
  id: true,
  orderNumber: true,
  status: true,
  shippingMethod: true,
  shippingAddress: true, // This might return null from Prisma, need to handle accordingly
  paymentMethod: true,
  paymentStatus: true,
  totalAmount: true,
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
  shippingAddress,
  paymentMethod,
  totalAmount,
  orderItems,
}: {
  userId: number;
  createdById?: number;
  orderNumber: string;
  status?: OrderStatus;
  shippingMethod: ShippingMethod;
  shippingAddress?: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  orderItems: {
    productId: number;
    variantId?: number;
    qty: number;
    price: number;
    subtotal: number;
  }[];
}) {
  return prisma.$transaction(async (tx) => {
    // Get the user to fetch their address
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { address: true }
    });

    // Use user's address if shippingAddress is not provided
    const finalShippingAddress = shippingAddress || user?.address || '';

    const newOrder = await tx.order.create({
      data: {
        userId,
        createdById,
        orderNumber,
        status: status || "pending",
        shippingMethod,
        shippingAddress: finalShippingAddress,
        paymentMethod,
        totalAmount,
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
    shippingAddress,
    paymentMethod,
    paymentStatus,
    totalAmount,
    orderItems,
  }: {
    userId?: number;
    createdById?: number;
    orderNumber?: string;
    status?: OrderStatus;
    shippingMethod?: ShippingMethod;
    shippingAddress?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    totalAmount?: number;
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
    // Get the current order to get the userId
    const currentOrder = await tx.order.findUnique({
      where: { id },
      select: { userId: true }
    });

    // Get the user to fetch their address
    const user = currentOrder?.userId 
      ? await tx.user.findUnique({
          where: { id: currentOrder.userId },
          select: { address: true }
        })
      : null;

    // Use user's address if shippingAddress is not provided and not explicitly null
    const finalShippingAddress = shippingAddress !== undefined 
      ? (shippingAddress || user?.address || '') 
      : undefined;

    const data: Partial<Order> = {};

    if (userId) data.userId = userId;
    if (createdById) data.createdById = createdById;
    if (orderNumber) data.orderNumber = orderNumber;
    if (status) data.status = status;
    if (shippingMethod) data.shippingMethod = shippingMethod;
    if (finalShippingAddress !== undefined) data.shippingAddress = finalShippingAddress;
    if (paymentMethod) data.paymentMethod = paymentMethod;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (totalAmount) data.totalAmount = totalAmount;

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
