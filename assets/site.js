// Tiny enhancements only; the site works without JS (the video embed plays on its own).
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Previous / Next for the YouTube uploads-playlist embed, via the iframe postMessage API.
const YT_ORIGIN = "https://www.youtube-nocookie.com";
const player = document.querySelector("[data-player]");
if (player) {
  const frame = player.querySelector("iframe");
  const now = player.querySelector("[data-now]");
  const titles = {};
  const state = { list: [], idx: 0 };
  const send = (msg) => frame.contentWindow && frame.contentWindow.postMessage(JSON.stringify({ id: 1, channel: "widget", ...msg }), YT_ORIGIN);
  const listen = () => send({ event: "listening" });
  frame.addEventListener("load", listen);
  listen();
  player.querySelectorAll("[data-cmd]").forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener("click", () => send({ event: "command", func: btn.dataset.cmd, args: [] }));
  });
  window.addEventListener("message", (e) => {
    if (e.origin !== YT_ORIGIN || e.source !== frame.contentWindow || typeof e.data !== "string") return;
    let d; try { d = JSON.parse(e.data); } catch { return; }
    const info = d && d.info;
    if (!info || !now) return;
    if (Array.isArray(info.playlist)) state.list = info.playlist;
    if (typeof info.playlistIndex === "number") state.idx = info.playlistIndex;
    const vd = info.videoData;
    if (vd && vd.title && vd.video_id) titles[vd.video_id] = vd.title;
    const id = state.list[state.idx];
    const pos = state.list.length ? `${state.idx + 1} of ${state.list.length}` : "";
    const title = titles[id] || (pos ? "Video" : "");
    if (title) now.textContent = pos ? `${title}  ·  ${pos}` : title;
  });
}
