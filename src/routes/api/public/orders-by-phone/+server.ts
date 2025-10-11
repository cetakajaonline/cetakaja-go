// src/routes/api/public/orders-by-phone/+server.ts
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
    
    // Create a schema for public order creation with phone number
    const publicOrderByPhoneSchema = orderSchema.extend({
      phone: z.string().min(10).max(15).regex(/^08\d+$/, "Nomor telepon harus diawali dengan 08 dan hanya berisi angka"),
      userId: z.number().optional(), // userId will be set internally based on phone number
    });
    
    const parsed = publicOrderByPhoneSchema.safeParse({
      ...body,
      status: 'pending',
      shippingMethod: body.shippingMethod || 'pickup',
      paymentMethod: body.paymentMethod || 'cash',
      userId: undefined // Ensure userId is undefined so we look up by phone
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
    
    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: {
        phone: data.phone
      }
    });
    
    if (!user) {
      return json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // Auto-generate order number for the day
    const orderNumber = await getNextOrderNumberForToday();

    // Check if order number already exists (shouldn't happen with our logic, but just in case)
    const existing = await getOrderByOrderNumber(orderNumber);
    if (existing) {
      return json({ message: "Order number sudah terdaftar" }, { status: 400 });
    }

    // Create the public order associated with the found user
    const newOrder = await createOrder({
      userId: user.id, // Use the user found by phone number
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
    console.error('Error creating public order by phone:', error);
    return json({ message: "Gagal membuat order" }, { status: 500 });
  }
};