import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAdmin } from "$lib/server/auth";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf"];
const mimeMap: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  pdf: "application/pdf"
};

export const POST: RequestHandler = async (event) => {
  requireAdmin(event);

  const formData = await event.request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("File tidak valid");
  }

  const ext = path.extname(file.name).toLowerCase().replace(".", "") || "bin";
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Ekstensi file .${ext} tidak diperbolehkan`);
  }

  // Validasi MIME (opsional tapi recommended)
  const mimeType = file.type;
  const expectedMime = mimeMap[ext];
  if (expectedMime && mimeType !== expectedMime) {
    throw new Error(`Tipe MIME tidak sesuai untuk ekstensi .${ext}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.resolve("static/uploads");
  const filePath = path.join(uploadDir, filename);

  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.error("Gagal menyimpan file:", err);
    throw new Error("Gagal menyimpan file ke server");
  }

  return json({ url: `/uploads/${filename}`, message: "Upload berhasil" });
};
