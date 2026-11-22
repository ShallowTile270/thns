import { loadApps, renderGrid, fillCategoryChips } from "./app.js";
const all = await loadApps();
const grid = document.getElementById("grid");
const q = document.getElementById("q");
const sort = document.getElementById("sort");
let cat = new URLSearchParams(location.search).get("category") || "";

function update() {
  const term = q.value.trim().toLowerCase();
  let list = all.filter((a) => (!cat || a.category === cat) &&
    (!term || `${a.name} ${a.tagline} ${a.description}`.toLowerCase().includes(term)));
  list.sort(sort.value === "votes" ? (a, b) => b.votes - a.votes : (a, b) => b.createdAt - a.createdAt);
  renderGrid(grid, list);
}
fillCategoryChips(document.getElementById("chips"), (c) => { cat = c; update(); }, cat);
q.addEventListener("input", update);
sort.addEventListener("change", update);
update();
