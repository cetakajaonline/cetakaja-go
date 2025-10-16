import prisma from "$lib/server/prisma";
import {
  createOrderNotification,
  createPaymentNotification,
  createAdminOrderNotification,
} from "$lib/server/notificationService";
import fs from "fs";
import path from "path";
import type { Prisma } from "@prisma/client";

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
      role: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  orderItems: {
    select: {
      id: true,
      qty: true,
      price: true,
      subtotal: true,
      notes: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      options: {
        select: {
          id: true,
          orderItemId: true,
          optionId: true,
          optionName: true,
          price: true,
          createdAt: true,
          option: {
            select: {
              id: true,
              optionName: true,
              price: true,
              variant: {
                select: {
                  id: true,
                  variantName: true,
                },
              },
            },
          },
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      orderId: true,
      userId: true,
      createdById: true,
      method: true,
      amount: true,
      status: true,
      transactionRef: true,
      paidAt: true,
      createdAt: true,
      proofs: {
        select: {
          id: true,
          paymentId: true,
          fileName: true,
          filePath: true,
          fileType: true,
          uploadedAt: true,
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
      role: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  orderItems: {
    select: {
      id: true,
      qty: true,
      price: true,
      subtotal: true,
      notes: true,
      productId: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
      options: {
        select: {
          id: true,
          orderItemId: true,
          optionId: true,
          optionName: true,
          price: true,
          createdAt: true,
          option: {
            select: {
              id: true,
              optionName: true,
              price: true,
              variant: {
                select: {
                  id: true,
                  variantName: true,
                },
              },
            },
          },
        },
      },
    },
  },
  payments: {
    select: {
      id: true,
      orderId: true,
      userId: true,
      createdById: true,
      method: true,
      amount: true,
      status: true,
      transactionRef: true,
      paidAt: true,
      createdAt: true,
      proofs: {
        select: {
          id: true,
          paymentId: true,
          fileName: true,
          filePath: true,
          fileType: true,
          uploadedAt: true,
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
            },
          },
        },
      },
    },
  });
}

// Helper function to handle payment creation/updates consistently
async function handlePaymentForOrder(
  tx: Prisma.TransactionClient,
  orderId: number,
  userId: number,
  createdById: number | null | undefined,
  paymentMethod: "transfer" | "qris" | "cash",
  totalAmount: number,
  paymentStatus?: "pending" | "confirmed" | "failed" | "refunded",
): Promise<boolean> {
  // Check if payment record already exists
  const existingPayment = await tx.payment.findFirst({
    where: { orderId },
  });

  if (!existingPayment) {
    // Create new payment record
    await tx.payment.create({
      data: {
        orderId,
        userId,
        createdById: createdById || null,
        method: paymentMethod,
        amount: totalAmount,
        status:
          paymentMethod === "cash" ? "confirmed" : paymentStatus || "pending",
      },
    });

    return true; // Indicate that a new payment was created
  } else {
    // Update existing payment record
    await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        method: paymentMethod,
        amount: totalAmount,
        status:
          paymentMethod === "cash"
            ? "confirmed"
            : paymentStatus || existingPayment.status,
        createdById: createdById || null,
      },
    });

    return false; // Indicate that payment was updated, not created
  }
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
    qty: number;
    price: number;
    subtotal: number;
    notes?: string;
    options?: {
      optionId: number;
      optionName: string;
      price: number;
    }[];
  }[];
}) {
  let newOrder;
  const isNewPaymentCreated = await prisma.$transaction(async (tx) => {
    newOrder = await tx.order.create({
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
            qty: item.qty,
            price: item.price,
            subtotal: item.subtotal,
            notes: item.notes || null,
            options: {
              create:
                item.options?.map((option) => ({
                  optionId: option.optionId,
                  optionName: option.optionName,
                  price: option.price,
                })) || [],
            },
          })),
        },
      },
      select: orderSelect,
    });

    // Handle payment creation consistently using the helper function
    const isNewPayment = await handlePaymentForOrder(
      tx,
      newOrder.id,
      userId,
      createdById,
      paymentMethod,
      totalAmount,
    );

    return isNewPayment;
  });

  // Create notifications outside the transaction to avoid foreign key constraint
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user && newOrder) {
    await createOrderNotification(newOrder, user);

    // Create payment notification if a new payment was created
    if (isNewPaymentCreated) {
      await createPaymentNotification(
        newOrder,
        user,
        paymentMethod === "cash" ? "pending" : "pending",
      ); // Cash is "pending" since payment happens later
    }

    // Create admin notification for new order
    await createAdminOrderNotification(newOrder, user);
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
      qty: number;
      price: number;
      subtotal: number;
      notes?: string;
      options?: {
        optionId: number;
        optionName: string;
        price: number;
      }[];
    }[];
  },
) {
  // Get the current order to check for changes before updating
  const currentOrder = await prisma.order.findUnique({
    where: { id },
  });

  if (!currentOrder) {
    throw new Error("Order not found");
  }

  let isNewPaymentCreated = false;
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
              id: item.id,
              productId: item.productId,
              qty: item.qty,
              price: item.price,
              subtotal: item.subtotal,
              notes: item.notes || null,
              options: {
                create:
                  item.options?.map((option) => ({
                    optionId: option.optionId,
                    optionName: option.optionName,
                    price: option.price,
                  })) || [],
              },
            })),
          },
        }),
      },
      select: orderSelect,
    });

    // Handle payment creation/updates consistently using the helper function if payment method is provided
    if (paymentMethod) {
      const wasNewPayment = await handlePaymentForOrder(
        tx,
        id,
        result.userId,
        result.createdById,
        paymentMethod,
        totalAmount || result.totalAmount,
        paymentStatus,
      );

      // Track if a new payment was created for notification purposes
      isNewPaymentCreated = wasNewPayment;
    }

    return result;
  });

  // Create notification outside the transaction to avoid foreign key constraint
  const user = await prisma.user.findUnique({
    where: { id: updatedOrder.userId },
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

    // Create payment notification if a new payment was created
    if (isNewPaymentCreated && paymentMethod) {
      await createPaymentNotification(
        updatedOrder,
        user,
        paymentMethod === "cash" ? "pending" : paymentStatus || "pending",
      ); // Cash is "pending" since payment happens later
    }
  }

  return updatedOrder;
}

export async function deleteOrder(id: number) {
  // Get all payment proofs associated with this order to delete their files
  const orderWithPayments = await prisma.order.findUnique({
    where: { id },
    include: {
      payments: {
        select: {
          proofs: {
            select: {
              id: true,
              filePath: true,
            },
          },
        },
      },
    },
  });

  if (!orderWithPayments) {
    throw new Error("Order not found");
  }

  // Delete all payment proof files from the filesystem
  for (const payment of orderWithPayments.payments) {
    for (const proof of payment.proofs) {
      if (proof.filePath) {
        try {
          const fullPath = path.join(process.cwd(), "static", proof.filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.error(
            `Gagal menghapus file bukti pembayaran: ${proof.filePath}`,
            err,
          );
          // Continue with deletion even if file deletion fails
        }
      }
    }
  }

  // Now delete the order (this will cascade delete payments and proofs due to Prisma schema)
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
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const datePrefix = `ORD-${year}${month}${day}`;

  // Find the highest order number with today's prefix
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: datePrefix,
      },
    },
    orderBy: {
      orderNumber: "desc",
    },
  });

  let nextNumber = 1;
  if (lastOrder) {
    // Extract the number part after the date (e.g., from ORD-251008-0005 get 0005)
    const lastNumber = parseInt(lastOrder.orderNumber.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${datePrefix}-${String(nextNumber).padStart(4, "0")}`;
}
