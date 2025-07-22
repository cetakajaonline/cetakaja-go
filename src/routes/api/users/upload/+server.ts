import { json, error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) throw error(400, "No file uploaded");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop();
  const filename = `${randomUUID()}.${ext}`;

  const uploadDir = "static/uploads";
  const filePath = path.join(uploadDir, filename);
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(filePath, buffer);

  return json({ url: `/uploads/${filename}` });
};
