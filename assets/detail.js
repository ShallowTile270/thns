import { loadApps, el, safeUrl } from "./app.js";
const root = document.getElementById("detail");
const id = new URLSearchParams(location.search).get("id");
const app = (await loadApps()).find((a) => a.id === id);

if (!app) {
  root.replaceChildren(el("p", { class: "empty", text: "App not found." }), el("a", { class: "btn", href: "/browse.html", text: "Browse apps" }));
} else {
  document.title = `${app.name} · Handshake App Hub`;
  const url = safeUrl(app.url);
  const shot = safeUrl(app.screenshot);
  const voteBtn = el("button", { class: "btn secondary", type: "button", text: `▲ Upvote (${app.votes || 0})` });
  const voteMsg = el("span", { class: "muted" });
  if (app.sample) voteBtn.disabled = true;
  voteBtn.addEventListener("click", async () => {
    voteBtn.disabled = true;
    try {
      const r = await fetch("/api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: app.id }) });
      const d = await r.json();
      if (r.ok) { voteBtn.textContent = `▲ Upvoted (${d.votes})`; voteMsg.textContent = d.already ? "You already voted." : "Thanks!"; }
      else { voteBtn.disabled = false; voteMsg.textContent = d.error || "Could not vote."; }
    } catch { voteBtn.disabled = false; voteMsg.textContent = "Network error."; }
  });

  root.replaceChildren(
    el("a", { class: "back", href: "/browse.html", text: "← All apps" }),
    el("div", { class: "detail-head" },
      el("div", {},
        el("div", { class: "badges" }, el("span", { class: "badge", text: app.category }),
          app.sample ? el("span", { class: "badge sample", text: "Sample listing" }) : null),
        el("h1", { text: app.name }), el("p", { class: "lead", text: app.tagline })),
      el("div", { class: "actions" },
        url ? el("a", { class: "btn", href: url, target: "_blank", rel: "noopener noreferrer nofollow", text: "Open app ↗" }) : null,
        voteBtn, voteMsg)),
    shot ? el("img", { class: "hero-shot", src: shot, alt: `${app.name} screenshot`, referrerpolicy: "no-referrer" }) : null,
    el("section", {}, el("h2", { text: "About" }), el("p", { class: "pre", text: app.description })),
    el("section", { class: "notice" },
      el("h2", { text: "Getting started" }),
      el("ol", {},
        el("li", { text: app.needsResolver
          ? "This app lives on a Handshake name, so your device needs a Handshake resolver (see the beginner guide) to open it."
          : "This app works over the regular web — no special setup needed." }),
        el("li", { text: "Click “Open app” — it opens in a new tab." }),
        el("li", { text: "Only connect a wallet or sign anything if you trust the app. Always check the URL." })),
      el("a", { href: "/index.html#start", text: "New to Handshake? Read the beginner guide →" })),
    el("p", { class: "muted small", text: "Listings are submitted by their creators. This hub doesn't audit or endorse apps — do your own research." }));
}
