import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const CATEGORIES = ["DeFi", "Social", "Voting & Governance", "Marketplace", "Media", "Tools", "Games", "Other"];

export const appsStore = () => getStore({ name: "apps", consistency: "strong" });
export const metaStore = () => getStore({ name: "meta", consistency: "strong" });

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const clientKey = (req, context) => {
  const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24);
};

export const publicView = (a) => ({
  id: a.id, name: a.name, tagline: a.tagline, description: a.description, url: a.url,
  category: a.category, screenshot: a.screenshot, needsResolver: a.needsResolver,
  featured: !!a.featured, votes: a.votes || 0, createdAt: a.createdAt,
});

export async function listApps(status) {
  const store = appsStore();
  const { blobs } = await store.list();
  const all = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return all.filter((a) => a && (!status || a.status === status));
}

export const isHttpUrl = (s) => {
  try { const u = new URL(s); return u.protocol === "https:" || u.protocol === "http:"; } catch { return false; }
};

export const adminOk = (req) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const given = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(token).digest();
  return crypto.timingSafeEqual(a, b);
};

// Allow max `limit` hits per key per hour. Returns true if allowed.
export async function rateLimit(key, limit) {
  const store = metaStore();
  const k = `rl:${key}:${Math.floor(Date.now() / 3600000)}`;
  const n = Number((await store.get(k)) || 0);
  if (n >= limit) return false;
  await store.set(k, String(n + 1));
  return true;
}
