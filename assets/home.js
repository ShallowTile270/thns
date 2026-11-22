import { loadApps, renderGrid } from "./app.js";
const apps = await loadApps();
const featured = apps.filter((a) => a.featured);
renderGrid(document.getElementById("featured"), (featured.length ? featured : apps).slice(0, 6));
const stat = document.getElementById("count");
if (stat) stat.textContent = apps.filter((a) => !a.sample).length;
import { fillCategoryChips } from "./app.js";
fillCategoryChips(document.getElementById("cats"), (c) => { location.href = `/browse.html?category=${encodeURIComponent(c)}`; });
