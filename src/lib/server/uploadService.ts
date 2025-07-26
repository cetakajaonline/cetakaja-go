import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const uploadDir = path.resolve("static/uploads");

export async function saveFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  // pastikan folder static/uploads ada
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(originalName);
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const filepath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filepath, buffer);

  // return URL relatif (untuk digunakan di src atau link)
  return `/uploads/${filename}`;
}
