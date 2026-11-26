// Tiny enhancements only; the site works without JS (the video embed plays on its own,
// and film-strip frames link to YouTube).
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Yin-yang nav: split colours only while the pill straddles the stage's top edge (top of the page).
// Crossing the threshold sends a water ripple through the page itself, outward from a point just below the bar,
// like a pebble dropped in a pond, and the bar's new colours arrive with the wavefront.
const navIn = document.querySelector(".nav-in");
if (navIn) {
  const SPLIT_BG = "linear-gradient(180deg,#1d1d1f 50%,#f2f2f4 50%)";
  const SOLID_BG = "#1d1d1f";
  const SVGNS = "http://www.w3.org/2000/svg";
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const page = document.querySelector("main");
  const WAVE_AT = 0.6; // where the ring sits in the displacement map (fraction of its radius)
  let split = window.scrollY < 4;
  let raf = 0, pond = null;
  navIn.classList.toggle("split", split);

  // One-off displacement map: a ring-shaped wave packet. R/G push pixels radially in and out.
  const makeMap = () => {
    const N = 256, c = document.createElement("canvas");
    c.width = c.height = N;
    const ctx = c.getContext("2d"), img = ctx.createImageData(N, N), h = N / 2;
    for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) {
      const dx = (xx + 0.5 - h) / h, dy = (yy + 0.5 - h) / h, d = Math.hypot(dx, dy);
      const w = (d - WAVE_AT) / 0.19; // a short train of crests, like a real ripple
      const amp = d > 0 && d < 1 ? Math.exp(-w * w) * Math.sin(w * Math.PI * 1.7) : 0;
      const i = (yy * N + xx) * 4;
      img.data[i] = 128 + 127 * amp * (d ? dx / d : 0);
      img.data[i + 1] = 128 + 127 * amp * (d ? dy / d : 0);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  };

  const makePond = () => {
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    const f = document.createElementNS(SVGNS, "filter");
    f.id = "pond";
    f.setAttribute("filterUnits", "userSpaceOnUse");
    f.setAttribute("primitiveUnits", "userSpaceOnUse");
    f.setAttribute("color-interpolation-filters", "sRGB");
    const map = document.createElementNS(SVGNS, "feImage");
    map.setAttribute("href", makeMap());
    map.setAttribute("preserveAspectRatio", "none");
    map.setAttribute("result", "ring");
    // Neutral grey under the map, so pixels outside the ring stay exactly where they are.
    const calm = document.createElementNS(SVGNS, "feFlood");
    calm.setAttribute("flood-color", "rgb(128,128,128)");
    calm.setAttribute("result", "calm");
    const merge = document.createElementNS(SVGNS, "feComposite");
    merge.setAttribute("in", "ring");
    merge.setAttribute("in2", "calm");
    merge.setAttribute("operator", "over");
    merge.setAttribute("result", "wave");
    const disp = document.createElementNS(SVGNS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "wave");
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "G");
    disp.setAttribute("scale", "0");
    f.append(calm, map, merge, disp);
    svg.append(f);
    document.body.append(svg);
    return { f, map, disp };
  };

  const fxLayer = () => {
    let el = navIn.querySelector(":scope > .nav-fx");
    if (!el) { el = document.createElement("div"); el.className = "nav-fx"; el.setAttribute("aria-hidden", "true"); navIn.prepend(el); }
    return el;
  };

  const ripple = (toSplit) => {
    cancelAnimationFrame(raf);
    const fx = fxLayer();
    fx.replaceChildren();
    if (page) page.style.filter = "";
    if (still.matches || !page) { navIn.classList.toggle("split", toSplit); return; }
    if (!pond) pond = makePond();

    const fill = document.createElement("i");
    fill.style.background = toSplit ? SPLIT_BG : SOLID_BG;
    fx.append(fill);
    page.style.filter = "url(#pond)";

    // Focal point: centred just below the bar. It is fixed to the page content, so if you scroll
    // mid-ripple it travels with the content by exactly the distance scrolled.
    const DURATION = 2000, start = performance.now();
    const b0 = navIn.getBoundingClientRect(), m0 = page.getBoundingClientRect();
    const ox = b0.left + b0.width / 2 - m0.left, oy = b0.bottom + 28 - m0.top; // in page coordinates
    const reach = Math.min(900, Math.max(420, innerWidth * 0.55));            // spreads outward, then fades
    const SOFT = 56;                                                         // soft edge of the colour reveal

    const frame = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      const r = reach * (1 - Math.pow(1 - t, 1.7));                          // near-steady spread, easing slightly
      const strength = 24 * Math.min(1, t / 0.12) * Math.pow(1 - t, 1.3);   // eases in, then calms
      const m = page.getBoundingClientRect();
      const size = Math.max(2, (2 * r) / WAVE_AT);
      pond.f.setAttribute("x", -m.left); pond.f.setAttribute("y", -m.top); // filter only the visible area
      pond.f.setAttribute("width", innerWidth); pond.f.setAttribute("height", innerHeight);
      pond.map.setAttribute("x", ox - size / 2); pond.map.setAttribute("y", oy - size / 2);
      pond.map.setAttribute("width", size); pond.map.setAttribute("height", size);
      pond.disp.setAttribute("scale", strength.toFixed(2));
      // The bar's new colours ride in behind the wavefront with a soft edge, fading up (no pop).
      const b = navIn.getBoundingClientRect();
      const cx = (m.left + ox - b.left).toFixed(1), cy = (m.top + oy - b.top).toFixed(1);
      const edge = r * 0.9, mask = `radial-gradient(circle at ${cx}px ${cy}px, #000 ${Math.max(0, edge - SOFT).toFixed(1)}px, transparent ${edge.toFixed(1)}px)`;
      fill.style.webkitMaskImage = mask;
      fill.style.maskImage = mask;
      fill.style.opacity = Math.min(1, t / 0.45).toFixed(3);
      if (t < 1) { raf = requestAnimationFrame(frame); return; }
      page.style.filter = "";
      navIn.classList.toggle("split", toSplit);
      fill.remove();
    };
    raf = requestAnimationFrame(frame);
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
