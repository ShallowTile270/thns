import { CATEGORIES, el } from "./app.js";
const sel = document.getElementById("category");
CATEGORIES.forEach((c) => sel.append(el("option", { value: c, text: c })));
const form = document.getElementById("form");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const body = Object.fromEntries(fd.entries());
  body.needsResolver = fd.get("needsResolver") === "on";
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true; msg.className = "msg"; msg.textContent = "Submitting…";
  try {
    const r = await fetch("/api/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    if (r.ok) { form.reset(); msg.className = "msg ok"; msg.textContent = "Thanks! Your app was submitted and will appear after review."; }
    else { msg.className = "msg err"; msg.textContent = d.error || "Something went wrong."; }
  } catch { msg.className = "msg err"; msg.textContent = "Network error. Please try again."; }
  btn.disabled = false;
});
