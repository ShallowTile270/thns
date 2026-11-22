import { appsStore, json, adminOk, listApps } from "./_lib.mjs";

export default async (req) => {
  if (!adminOk(req)) return json({ error: "Unauthorized" }, 401);
  const store = appsStore();

  if (req.method === "GET") {
    const apps = (await listApps()).sort((a, b) => b.createdAt - a.createdAt);
    return json({ apps });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const { action, id } = body;
  const app = id ? await store.get(String(id), { type: "json" }) : null;
  if (!app) return json({ error: "Not found" }, 404);

  switch (action) {
    case "approve": app.status = "approved"; break;
    case "reject": app.status = "rejected"; app.featured = false; break;
    case "feature": app.featured = !app.featured; break;
    case "delete": await store.delete(app.id); return json({ ok: true });
    default: return json({ error: "Unknown action" }, 400);
  }
  await store.setJSON(app.id, app);
  return json({ ok: true, app });
};
