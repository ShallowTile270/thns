import { appsStore, metaStore, json, clientKey } from "./_lib.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const id = String(body.id || "");
  const store = appsStore();
  const app = id ? await store.get(id, { type: "json" }) : null;
  if (!app || app.status !== "approved") return json({ error: "Not found" }, 404);

  const meta = metaStore();
  const vk = `vote:${id}:${clientKey(req, context)}`;
  if (await meta.get(vk)) return json({ ok: true, votes: app.votes || 0, already: true });
  await meta.set(vk, "1");
  app.votes = (app.votes || 0) + 1;
  await store.setJSON(id, app);
  return json({ ok: true, votes: app.votes });
};
