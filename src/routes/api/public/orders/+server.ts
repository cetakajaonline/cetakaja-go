// src/routes/api/public/orders/+server.ts
import { json } from "@sveltejs/kit";
import { z } from "zod";
import {
  createOrder,
  getNextOrderNumberForToday,
  getOrderByOrderNumber
} from "$lib/server/orderService";
import { orderSchema } from "$lib/validations/orderSchema";
import prisma from "$lib/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  try {
    const body = await event.request.json();
    
    // Create a schema that allows optional userId for public orders
    const publicOrderSchema = orderSchema.extend({
      userId: z.number().optional(), // userId will be set internally for public orders
    });
    
    const parsed = publicOrderSchema.safeParse({
      ...body,
      status: 'pending',
      shippingMethod: body.shippingMethod || 'pickup',
      paymentMethod: body.paymentMethod || 'cash',
      userId: undefined // Ensure userId is undefined so we use the default
    });

    if (!parsed.success) {
      return json(
        {
          message: "Validasi gagal",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Create or find a default customer user for public orders
    // We'll create a guest user if one doesn't exist
    let customerUser = await prisma.user.findFirst({
      where: {
        username: "public_customer",
        role: "customer"
      }
    });

    if (!customerUser) {
      customerUser = await prisma.user.create({
        data: {
          name: "Pelanggan Umum",
          username: "public_customer",
          phone: "000000000000",
          password: "$2a$10$00000000000000000000000000000000000000000000000000000", // Placeholder encrypted password
          role: "customer",
          address: "Lokasi tidak diketahui" // Default address for public orders
        }
      });
    }

    // Auto-generate order number for the day
    const orderNumber = await getNextOrderNumberForToday();

    // Check if order number already exists (shouldn't happen with our logic, but just in case)
    const existing = await getOrderByOrderNumber(orderNumber);
    if (existing) {
      return json({ message: "Order number sudah terdaftar" }, { status: 400 });
    }

    // Create the public order
    const newOrder = await createOrder({
      userId: customerUser.id, // Use the public customer user
      createdById: null, // No staff created this order
      orderNumber,
      status: data.status,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      notes: data.notes || undefined,
      orderItems: data.orderItems || [],
    });

    return json(newOrder);
  } catch (error) {
    console.error('Error creating public order:', error);
    return json({ message: "Gagal membuat order" }, { status: 500 });
  }
};