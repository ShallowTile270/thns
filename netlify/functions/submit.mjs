import crypto from "node:crypto";
import { appsStore, json, clientKey, isHttpUrl, rateLimit, CATEGORIES } from "./_lib.mjs";

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  // Honeypot: bots fill this in. Pretend success.
  if (body.website) return json({ ok: true });

  if (!(await rateLimit(`submit:${clientKey(req, context)}`, 3))) {
    return json({ error: "Too many submissions. Try again in an hour." }, 429);
  }

  const name = clean(body.name, 60);
  const tagline = clean(body.tagline, 100);
  const description = String(body.description ?? "").trim().slice(0, 1500);
  const url = clean(body.url, 300);
  const screenshot = clean(body.screenshot, 300);
  const contact = clean(body.contact, 120);
  const category = CATEGORIES.includes(body.category) ? body.category : "Other";

  if (name.length < 2) return json({ error: "Please enter an app name." }, 400);
  if (tagline.length < 5) return json({ error: "Please add a short tagline." }, 400);
  if (description.length < 20) return json({ error: "Description should be at least 20 characters." }, 400);
  if (!isHttpUrl(url)) return json({ error: "App URL must start with http:// or https://" }, 400);
  if (screenshot && !isHttpUrl(screenshot)) return json({ error: "Screenshot URL must be http(s)." }, 400);

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "app";
  const id = `${slug}-${crypto.randomBytes(3).toString("hex")}`;

  await appsStore().setJSON(id, {
    id, name, tagline, description, url, category, screenshot, contact,
    needsResolver: !!body.needsResolver,
    status: "pending", featured: false, votes: 0, createdAt: Date.now(),
  });
  return json({ ok: true });
};
