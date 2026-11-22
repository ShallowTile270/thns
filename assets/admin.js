import { el } from "./app.js";
const tokenIn = document.getElementById("token");
const list = document.getElementById("list");
const msg = document.getElementById("msg");
try { tokenIn.value = sessionStorage.getItem("hubtoken") || ""; } catch {}

async function call(method, body) {
  const r = await fetch("/api/admin", { method, headers: { authorization: `Bearer ${tokenIn.value}`, "content-type": "application/json" }, body: body && JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Request failed");
  return d;
}

async function load() {
  msg.textContent = "";
  try {
    const { apps } = await call("GET");
    try { sessionStorage.setItem("hubtoken", tokenIn.value); } catch {}
    list.replaceChildren();
    const order = { pending: 0, approved: 1, rejected: 2 };
    apps.sort((a, b) => order[a.status] - order[b.status]);
    if (!apps.length) list.append(el("p", { class: "muted", text: "No submissions yet." }));
    for (const a of apps) {
      const act = (action, label, cls = "btn small secondary") => el("button", { class: cls, type: "button", text: label,
        onclick: async () => { if (action === "delete" && !confirm("Delete permanently?")) return; try { await call("POST", { action, id: a.id }); load(); } catch (e) { msg.textContent = e.message; } } });
      list.append(el("article", { class: "admin-row" },
        el("div", {},
          el("div", { class: "badges" }, el("span", { class: "badge " + a.status, text: a.status }), el("span", { class: "badge", text: a.category }), a.featured ? el("span", { class: "badge featured", text: "★" }) : null),
          el("h3", { text: a.name }), el("p", { text: a.tagline }), el("p", { class: "pre small", text: a.description }),
          el("p", { class: "small muted", text: `${a.url}  ·  contact: ${a.contact || "—"}  ·  votes: ${a.votes || 0}` })),
        el("div", { class: "row-actions" },
          a.status !== "approved" ? act("approve", "Approve", "btn small") : null,
          a.status !== "rejected" ? act("reject", "Reject") : null,
          a.status === "approved" ? act("feature", a.featured ? "Unfeature" : "Feature") : null,
          act("delete", "Delete"))));
    }
  } catch (e) { list.replaceChildren(); msg.textContent = e.message; }
}
document.getElementById("login").addEventListener("submit", (e) => { e.preventDefault(); load(); });
if (tokenIn.value) load();
