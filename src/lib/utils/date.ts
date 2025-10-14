// utils/date.ts

export function formatDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toISOStringLocal(date: Date): string {
  const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(date.getTime() - tzoffset).toISOString().slice(0, -1);
}

/**
 * Convert Date object to datetime-local format (YYYY-MM-DDTHH:mm)
 * @param date The date to convert
 * @returns Formatted datetime string for HTML input
 */
export function dateToDateTimeLocal(date: Date): string {
  const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localDate = new Date(date.getTime() - tzoffset);
  return localDate.toISOString().slice(0, 16);
}

/**
 * Convert datetime-local format to Date object
 * @param value The datetime string in YYYY-MM-DDTHH:mm format
 * @returns Date object
 */
export function dateTimeLocalToDate(value: string): Date {
  return new Date(value);
}
