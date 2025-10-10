// API endpoint for n8n or external services to fetch pending notifications
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import {
  getPendingNotifications,
  updateNotificationStatus,
} from "$lib/server/notificationService";

export async function GET() {
  try {
    // This could be secured with an API key for n8n access
    // const apiKey = event.request.headers.get('X-API-Key');
    // if (apiKey !== process.env.N8N_API_KEY) {
    //   return json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const notifications = await getPendingNotifications();

    return json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return json({ message: "Gagal mengambil notifikasi" }, { status: 500 });
  }
}

export async function PUT(event: RequestEvent) {
  try {
    // Endpoint to update notification status after processing by n8n
    const { notificationId, status } = await event.request.json();

    if (!notificationId || !status) {
      return json(
        { message: "ID notifikasi dan status wajib disertakan" },
        { status: 400 },
      );
    }

    if (!["sent", "failed"].includes(status)) {
      return json(
        { message: 'Status tidak valid. Gunakan "sent" atau "failed"' },
        { status: 400 },
      );
    }

    const updatedNotification = await updateNotificationStatus(
      notificationId,
      status,
    );

    return json(updatedNotification);
  } catch (error) {
    console.error("Error updating notification status:", error);
    return json(
      { message: "Gagal memperbarui status notifikasi" },
      { status: 500 },
    );
  }
}
