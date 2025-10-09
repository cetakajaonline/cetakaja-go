// src/routes/api/orders/next-number/+server.ts
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getNextOrderNumberForToday } from "$lib/server/orderService";

export const GET: RequestHandler = async () => {
  try {
    const nextOrderNumber = await getNextOrderNumberForToday();
    return json({ orderNumber: nextOrderNumber });
  } catch (error) {
    console.error("Error getting next order number:", error);
    return json(
      { message: "Gagal mengambil nomor order berikutnya" },
      { status: 500 },
    );
  }
};
