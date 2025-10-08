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
    const newOrder = await tx.order.create({
      data: {
        userId,
        createdById,
        orderNumber,
        status: status || "pending",
        shippingMethod,
        shippingAddress,
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
  const data: Partial<Order> = {};

  if (userId) data.userId = userId;
  if (createdById) data.createdById = createdById;
  if (orderNumber) data.orderNumber = orderNumber;
  if (status) data.status = status;
  if (shippingMethod) data.shippingMethod = shippingMethod;
  if (shippingAddress) data.shippingAddress = shippingAddress;
  if (paymentMethod) data.paymentMethod = paymentMethod;
  if (paymentStatus) data.paymentStatus = paymentStatus;
  if (totalAmount) data.totalAmount = totalAmount;

  return prisma.$transaction(async (tx) => {
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
