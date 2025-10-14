/**
 * Format currency for Indonesian Rupiah
 * @param amount The amount to format
 * @returns Formatted currency string in IDR
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("id-ID");
}

/**
 * Format date for date picker input
 * @param date The date to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get status badge class based on status
 * @param status The status string
 * @returns The appropriate CSS class for the status badge
 */
export function getStatusClass(status: string): string {
  switch (status) {
    case "pending":
      return "badge-warning";
    case "processing":
      return "badge-info";
    case "finished":
      return "badge-success";
    case "canceled":
      return "badge-error";
    default:
      return "badge-neutral";
  }
}

/**
 * Get status display text based on status
 * @param status The status string
 * @returns The display text for the status
 */
export function getStatusDisplayText(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "finished":
      return "Selesai";
    case "canceled":
      return "Dibatalkan";
    default:
      return status;
  }
}
