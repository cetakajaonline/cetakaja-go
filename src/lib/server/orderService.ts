import prisma from "$lib/server/prisma";
import { createOrderNotification, createPaymentNotification } from "$lib/server/notificationService";

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
      phone: true,
      address: true,
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

const orderDetailSelect = {
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
  // Relations - including payments with proofs
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      address: true,
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
  payments: {
    select: {
      id: true,
      method: true,
      amount: true,
      status: true,
      transactionRef: true,
      paidAt: true,
      createdAt: true,
      proofs: {
        select: {
          id: true,
          fileName: true,
          filePath: true,
          fileType: true,
          uploadedAt: true,
        }
      }
    }
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

export async function getOrderDetailById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    select: orderDetailSelect,
  });
}

// Also update the basic get order to include minimal payment info if needed elsewhere
export async function getOrderWithPayments(id: number) {
  return prisma.order.findUnique({
    where: { id },
    select: {
      ...orderSelect,
      payments: {
        select: {
          id: true,
          method: true,
          amount: true,
          status: true,
          transactionRef: true,
          paidAt: true,
          proofs: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
              fileType: true,
              uploadedAt: true,
            }
          }
        }
      }
    },
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
  const newOrder = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
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

    // If payment method is transfer or qris, create a payment record
    if (paymentMethod === "transfer" || paymentMethod === "qris") {
      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          userId, // customer who made the payment
          createdById, // staff/admin who created the order
          method: paymentMethod,
          amount: totalAmount,
          status: "pending", // payment status starts as pending until confirmed
        }
      });
    } 
    // For cash payments, also create a payment record (but without proof needed)
    else if (paymentMethod === "cash") {
      await tx.payment.create({
        data: {
          orderId: createdOrder.id,
          userId,
          createdById,
          method: paymentMethod,
          amount: totalAmount,
          status: "confirmed", // cash payments are typically confirmed immediately
        }
      });
    }

    return createdOrder;
  });

  // Create notification outside the transaction to avoid foreign key constraint
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (user) {
    await createOrderNotification(newOrder, user);
  }

  return newOrder;
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
  // Get the current order to check for changes before updating
  const currentOrder = await prisma.order.findUnique({
    where: { id }
  });

  if (!currentOrder) {
    throw new Error('Order not found');
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
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
    const result = await tx.order.update({
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

    // If payment method changed to transfer/qris and no payment exists, create a payment record
    if (paymentMethod && (paymentMethod === "transfer" || paymentMethod === "qris")) {
      const existingPayment = await tx.payment.findFirst({
        where: { orderId: id }
      });
      
      if (!existingPayment) {
        await tx.payment.create({
          data: {
            orderId: id,
            userId: result.userId, // customer who made the payment
            createdById: result.createdById, // staff/admin who created the order
            method: paymentMethod,
            amount: totalAmount || result.totalAmount,
            status: paymentStatus || "pending", // payment status starts as pending until confirmed
          }
        });
      } else {
        // Update existing payment if method changed
        await tx.payment.update({
          where: { id: existingPayment.id }, // Use the payment's ID instead of orderId
          data: {
            method: paymentMethod,
            amount: totalAmount || result.totalAmount,
            status: paymentStatus || existingPayment.status,
          }
        });
      }
    } 
    // For cash payments, create or update payment record as confirmed
    else if (paymentMethod && paymentMethod === "cash") {
      const existingPayment = await tx.payment.findFirst({
        where: { orderId: id }
      });
      
      if (!existingPayment) {
        await tx.payment.create({
          data: {
            orderId: id,
            userId: result.userId,
            createdById: result.createdById,
            method: paymentMethod,
            amount: totalAmount || result.totalAmount,
            status: "confirmed", // cash payments are typically confirmed immediately
          }
        });
      } else {
        // Update existing payment
        await tx.payment.update({
          where: { id: existingPayment.id }, // Use the payment's ID instead of orderId
          data: {
            method: paymentMethod,
            amount: totalAmount || result.totalAmount,
            status: "confirmed",
          }
        });
      }
    }

    return result;
  });

  // Create notification outside the transaction to avoid foreign key constraint
  const user = await prisma.user.findUnique({
    where: { id: updatedOrder.userId }
  });
  
  if (user) {
    // Create notification if order status changed
    if (status && currentOrder.status !== status) {
      await createOrderNotification(updatedOrder, user);
    }
    
    // Create notification if payment status changed
    if (paymentStatus && currentOrder.paymentStatus !== paymentStatus) {
      await createPaymentNotification(updatedOrder, user, paymentStatus);
    }
  }

  return updatedOrder;
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
