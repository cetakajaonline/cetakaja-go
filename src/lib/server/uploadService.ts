import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Daftar ekstensi yang diizinkan
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"];

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  subdirectory?: string,
): Promise<string> {
  // Base directory
  const baseUploadDir = path.resolve("static/uploads");

  // Full upload directory path
  const uploadDir = subdirectory
    ? path.join(baseUploadDir, subdirectory)
    : baseUploadDir;

  // Pastikan folder upload tersedia
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Ambil ekstensi file
  let ext = path.extname(originalName).toLowerCase().replace(".", "") || "bin";

  // Normalisasi .jpeg → .jpg
  if (ext === "jpeg") ext = "jpg";

  // Validasi ekstensi
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Ekstensi file .${ext} tidak diizinkan`);
  }

  // Buat nama file acak
  const filename = `${Date.now()}-${randomUUID()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  // Simpan file ke disk
  await fs.promises.writeFile(filepath, buffer);

  // Build the return path based on subdirectory
  const returnPath = subdirectory
    ? `/uploads/${subdirectory}/${filename}`
    : `/uploads/${filename}`;

  // Return path relatif untuk digunakan di <img src="/uploads/..." />
  return returnPath;
}

// Specialized functions for different file types
export async function saveExpenseFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  return saveFile(buffer, originalName, "expenses");
}

export async function saveSettingFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  return saveFile(buffer, originalName, "settings");
}

export async function saveLogoFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  return saveFile(buffer, originalName, "logo");
}

export async function saveProductFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  return saveFile(buffer, originalName, "products");
}

export async function savePaymentFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  return saveFile(buffer, originalName, "payments");
}

export async function saveQrisImageFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  return saveFile(buffer, originalName, "qris");
}
