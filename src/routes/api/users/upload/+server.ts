import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAdmin } from "$lib/server/auth";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export const POST: RequestHandler = async (event) => {
  requireAdmin(event); // Akan throw error 403 jika bukan admin

  const formData = await event.request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw error(400, "Invalid file upload");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Validasi ekstensi (opsional, tapi penting untuk keamanan)
  const ext = path.extname(file.name).toLowerCase().replace(".", "") || "bin";
  const allowedExt = ["jpg", "jpeg", "png", "gif", "pdf"];
  if (!allowedExt.includes(ext)) {
    throw error(400, `Ekstensi file .${ext} tidak diperbolehkan`);
  }

  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.resolve("static/uploads"); // ✅ lebih aman cross-platform
  const filePath = path.join(uploadDir, filename);

  // Pastikan folder ada
  fs.mkdirSync(uploadDir, { recursive: true });

  // Tulis file ke disk
  fs.writeFileSync(filePath, buffer);

  return json({ url: `/uploads/${filename}`, message: "Upload berhasil" });
};
