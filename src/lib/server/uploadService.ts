import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Direktori penyimpanan file
const uploadDir = path.resolve("static/uploads");

// Daftar ekstensi yang diizinkan
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf"];

export async function saveFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
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

  // Return path relatif untuk digunakan di <img src="/uploads/...\" />
  return `/uploads/${filename}`;
}