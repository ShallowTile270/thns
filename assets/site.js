// Tiny enhancements only; the site works without JS (the video embed plays on its own,
// and film-strip frames link to YouTube).
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Yin-yang nav: split colours only while the pill straddles the stage's top edge (top of the page).
// Crossing the threshold ripples the new look outward from the red pill, like a pebble in a pond.
const navIn = document.querySelector(".nav-in");
if (navIn) {
  const SPLIT_BG = "linear-gradient(180deg,#1d1d1f 50%,#f2f2f4 50%)";
  const SOLID_BG = "#1d1d1f";
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pebble = navIn.querySelector(".mark img") || navIn;
  let split = window.scrollY < 4;
  let running = [];
  navIn.classList.toggle("split", split);

  const layer = (cls) => {
    let el = navIn.querySelector(":scope > ." + cls);
    if (!el) { el = document.createElement("div"); el.className = cls; el.setAttribute("aria-hidden", "true"); navIn.prepend(el); }
    return el;
  };

  const ripple = (toSplit) => {
    running.forEach((a) => a.cancel());
    running = [];
    const fx = layer("nav-fx"), rings = layer("nav-rings");
    fx.replaceChildren(); rings.replaceChildren();
    if (still.matches || !navIn.animate) { navIn.classList.toggle("split", toSplit); return; }

    const box = navIn.getBoundingClientRect(), p = pebble.getBoundingClientRect();
    const ox = p.left + p.width / 2 - box.left, oy = p.top + p.height / 2 - box.top;
    const R = Math.hypot(Math.max(ox, box.width - ox), Math.max(oy, box.height - oy)) + 4;

    const fill = document.createElement("i");
    fill.style.background = toSplit ? SPLIT_BG : SOLID_BG;
    fx.append(fill);
    const grow = fill.animate(
      [{ clipPath: `circle(0px at ${ox}px ${oy}px)` }, { clipPath: `circle(${R}px at ${ox}px ${oy}px)` }],
      { duration: 750, easing: "cubic-bezier(.22,.8,.25,1)", fill: "forwards" }
    );
    running.push(grow);
    grow.finished.then(() => { navIn.classList.toggle("split", toSplit); fill.remove(); }).catch(() => {});

    const reach = R * 2.6; // final ring diameter; rings grow in size (not scale) so the stroke stays thin
    for (let k = 0; k < 3; k++) {
      const ring = document.createElement("i");
      ring.style.left = ox + "px";
      ring.style.top = oy + "px";
      rings.append(ring);
      const a = ring.animate(
        [
          { width: "8px", height: "8px", marginLeft: "-4px", marginTop: "-4px", opacity: 1 },
          { width: reach + "px", height: reach + "px", marginLeft: -reach / 2 + "px", marginTop: -reach / 2 + "px", opacity: 0 }
        ],
        { duration: 1300, delay: k * 170, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }
      );
      running.push(a);
      a.finished.then(() => ring.remove()).catch(() => {});
    }
  };

  window.addEventListener("scroll", () => {
    const want = window.scrollY < 4;
    if (want === split) return;
    split = want;
    ripple(want);
  }, { passive: true });
}

// Previous / Next (and the film strip) for the YouTube playlist embed, via the iframe postMessage API.
const YT_ORIGIN = "https://www.youtube-nocookie.com";
const VIDEO_ID = /^[\w-]{11}$/;
const player = document.querySelector("[data-player]");

if (player) {
  const frame = player.querySelector("iframe");
  const now = player.querySelector("[data-now]");
  const film = document.querySelector("[data-film]");
  const track = film && film.querySelector(".film-track");
  const titles = {};
  const state = { list: [], idx: 0, listKey: "", activeId: "" };

  const send = (msg) => frame.contentWindow && frame.contentWindow.postMessage(JSON.stringify({ id: 1, channel: "widget", ...msg }), YT_ORIGIN);
  const listen = () => send({ event: "listening" });
  frame.addEventListener("load", listen);
  listen();

  player.querySelectorAll("[data-cmd]").forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener("click", () => send({ event: "command", func: btn.dataset.cmd, args: [] }));
  });

  // ---- Film strip ----
  const frames = {};
  if (track) {
    track.querySelectorAll(".frame[data-id]").forEach((a) => {
      frames[a.dataset.id] = a.closest("li");
      const cap = a.querySelector(".cap");
      if (cap) titles[a.dataset.id] = cap.textContent;
    });
    track.addEventListener("click", (e) => {
      const a = e.target.closest(".frame[data-id]");
      if (!a) return;
      e.preventDefault();
      const i = state.list.indexOf(a.dataset.id);
      send({ event: "command", func: "playVideoAt", args: [i >= 0 ? i : [...track.children].indexOf(a.closest("li"))] });
    });
  }

  const makeFrame = (id) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "frame";
    a.href = `https://www.youtube.com/watch?v=${id}`;
    a.rel = "noopener noreferrer";
    a.dataset.id = id;
    const shot = document.createElement("span");
    shot.className = "shot";
    const img = document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    img.alt = "";
    img.width = 320;
    img.height = 180;
    img.loading = "lazy";
    shot.append(img);
    const edge = document.createElement("span");
    edge.className = "edge";
    const cap = document.createElement("span");
    cap.className = "cap";
    cap.textContent = titles[id] || "New video";
    a.append(shot, edge, cap);
    li.append(a);
    return li;
  };

  const renumber = () => {
    [...track.children].forEach((li, n) => {
      const edge = li.querySelector(".edge");
      if (!edge) return;
      edge.textContent = "TENDO 442 ▸ ";
      const b = document.createElement("b");
      b.textContent = String(n + 1).padStart(2, "0");
      edge.append(b, "A");
    });
  };

  const syncFilm = () => {
    if (!track || !state.list.length) return;
    const key = state.list.join(",");
    if (key !== state.listKey) {
      state.listKey = key;
      state.list.forEach((id) => {
        if (!VIDEO_ID.test(id)) return;
        if (!frames[id]) frames[id] = makeFrame(id);
        track.append(frames[id]); // re-appending moves it, so the strip follows the playlist order
      });
      Object.keys(frames).forEach((id) => { if (!state.list.includes(id)) frames[id].remove(); });
      renumber();
    }
    const id = state.list[state.idx];
    if (titles[id] && frames[id]) {
      const cap = frames[id].querySelector(".cap");
      if (cap && cap.textContent !== titles[id]) cap.textContent = titles[id];
    }
    if (id === state.activeId) return;
    state.activeId = id;
    Object.entries(frames).forEach(([fid, li]) => {
      const a = li.querySelector(".frame");
      a.classList.toggle("on", fid === id);
      if (fid === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    const li = frames[id];
    if (li) film.scrollTo({ left: li.offsetLeft - (film.clientWidth - li.offsetWidth) / 2, behavior: "smooth" });
  };

  window.addEventListener("message", (e) => {
    if (e.origin !== YT_ORIGIN || e.source !== frame.contentWindow || typeof e.data !== "string") return;
    let d; try { d = JSON.parse(e.data); } catch { return; }
    const info = d && d.info;
    if (!info) return;
    if (Array.isArray(info.playlist)) state.list = info.playlist;
    if (typeof info.playlistIndex === "number") state.idx = info.playlistIndex;
    const vd = info.videoData;
    if (vd && vd.title && vd.video_id) titles[vd.video_id] = vd.title;
    const id = state.list[state.idx];
    const pos = state.list.length ? `${state.idx + 1} of ${state.list.length}` : "";
    const title = titles[id] || (pos ? "Video" : "");
    if (now && title) now.textContent = pos ? `${title}  ·  ${pos}` : title;
    syncFilm();
  });
}
