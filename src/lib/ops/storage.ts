/* Photo storage for the inspection portal, using Supabase Storage over its REST
   API (so we don't add the supabase-js client). Needs SUPABASE_URL and
   SUPABASE_SERVICE_ROLE_KEY in the environment (Vercel + .env.local). Photos go
   in a public "inspections" bucket and are served by their public URL. */

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET = "inspections";

export function storageConfigured(): boolean {
  return !!(SUPABASE_URL && KEY);
}

let bucketReady = false;
async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "application/json" },
      // public bucket + generous size limit; a 400 "already exists" is fine
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 10485760 }),
    });
  } catch {
    /* ignore — likely already exists */
  }
  bucketReady = true;
}

/** Upload a base64 data-URL image and return its public URL. */
export async function uploadInspectionPhoto(dataUrl: string, pathBase: string): Promise<string> {
  if (!storageConfigured()) throw new Error("storage-not-configured");
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!m) throw new Error("bad-image");
  const contentType = m[1];
  const ext = contentType.split("/")[1].replace("jpeg", "jpg");
  const buf = Buffer.from(m[2], "base64");
  await ensureBucket();
  const path = `${pathBase}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buf,
  });
  if (!res.ok) throw new Error(`upload-failed:${res.status}:${await res.text().catch(() => "")}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
