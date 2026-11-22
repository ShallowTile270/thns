export const CATEGORIES = ["DeFi", "Social", "Voting & Governance", "Marketplace", "Media", "Tools", "Games", "Other"];

export function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null) n.append(kid);
  return n;
}

export const safeUrl = (u) => { try { const p = new URL(u); return /^https?:$/.test(p.protocol) ? p.href : ""; } catch { return ""; } };

export async function loadApps() {
  let apps = [];
  try {
    const r = await fetch("/api/apps");
    if (r.ok) apps = (await r.json()).apps;
  } catch { /* offline or functions not running */ }
  if (apps.length === 0) {
    try { apps = await (await fetch("/assets/seed.json")).json(); } catch { /* ignore */ }
  }
  return apps;
}

export function card(app) {
  const link = el("a", { class: "card-link", href: `/app.html?id=${encodeURIComponent(app.id)}`, "aria-label": `View ${app.name}` });
  const shot = safeUrl(app.screenshot);
  const thumb = shot
    ? el("img", { class: "thumb", src: shot, alt: "", loading: "lazy", referrerpolicy: "no-referrer" })
    : el("div", { class: "thumb placeholder", text: app.name.replace(/^Example:\s*/, "").slice(0, 1).toUpperCase() });
  return el("article", { class: "card" },
    link, thumb,
    el("div", { class: "card-body" },
      el("div", { class: "badges" },
        el("span", { class: "badge", text: app.category }),
        app.featured ? el("span", { class: "badge featured", text: "★ Featured" }) : null,
        app.sample ? el("span", { class: "badge sample", text: "Sample" }) : null),
      el("h3", { text: app.name }),
      el("p", { text: app.tagline }),
      el("div", { class: "meta" }, el("span", { text: `▲ ${app.votes || 0}` }),
        app.needsResolver ? el("span", { text: "Needs HNS resolver" }) : null)));
}

export function renderGrid(container, apps) {
  container.replaceChildren();
  if (!apps.length) { container.append(el("p", { class: "empty", text: "No apps match. Be the first to submit one!" })); return; }
  apps.forEach((a) => container.append(card(a)));
}

export function fillCategoryChips(container, onPick, active = "") {
  container.replaceChildren();
  ["All", ...CATEGORIES].forEach((c) => {
    const val = c === "All" ? "" : c;
    container.append(el("button", {
      type: "button", class: "chip" + (val === active ? " active" : ""), text: c,
      onclick: (ev) => { container.querySelectorAll(".chip").forEach((x) => x.classList.remove("active")); ev.currentTarget.classList.add("active"); onPick(val); },
    }));
  });
}
