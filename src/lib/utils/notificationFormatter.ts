import type { Notification } from "$lib/types";

// Format notification for WhatsApp message via EvolutionAPI
export function formatWhatsAppMessage(notification: Notification) {
  // EvolutionAPI expects a specific format for WhatsApp messages
  return {
    number: notification.toNumber, // Phone number without country code or with country code
    options: {
      delay: 1200, // Delay in milliseconds between messages
      presence: "composing", // Typing indicator
    },
    text: {
      message: notification.message, // The actual message content
    },
  };
}

// Function to validate phone number format
export function validatePhoneNumber(phone: string): boolean {
  // Simple validation for Indonesian phone numbers
  // Remove any non-digit characters and check if starts with 62 or has 0 at the start
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    // Replace 0 with 62 for Indonesian numbers
    return true;
  } else if (cleaned.startsWith("62")) {
    // Already in international format
    return true;
  }

  // Can add more validation rules as needed
  return true;
}

// Helper function for n8n integration
export function prepareForEvolutionAPI(notifications: Notification[]) {
  return notifications.map((notification) => ({
    ...formatWhatsAppMessage(notification),
    notificationId: notification.id, // Include notification ID for tracking
    userId: notification.userId, // Include userId for reference
    orderId: notification.orderId, // Include order ID for reference
  }));
}

