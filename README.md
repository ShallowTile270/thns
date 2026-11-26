# Tendo

Tendo's static site on Handshake: a landing page plus Videos, Podcasts, News and Links.
Plain HTML/CSS (one tiny optional JS file). No build step, no server code.

## Pages
- `index.html`: landing page (title, "Welcome to Handshake.", section links, Explore tiles)
- `index.html` and `videos.html` embed the "Tendo" YouTube playlist (`PLfO0ZjzU8g3o`) with Previous/Next buttons. **Reorder, add or remove videos in YouTube** and the site follows automatically, with no code changes. To use a different playlist, change `list=` in the iframe `src` in both files. `videos.html` also shows a film strip of thumbnails under the player: click a frame to play it. The strip reorders itself to match the playlist and adds frames for new uploads. Titles and durations for the current videos are in the HTML; new uploads show "New video" until you add their `<li>` (copy an existing one). The buttons and strip talk to the player via postMessage in `assets/site.js`; `netlify.toml` allows frames from `www.youtube-nocookie.com` only.
- `links.html`: favourite tools, explorers and wallets, grouped by category. Copy an `<li>` to add one (see the comment at the top of the file).
- `podcasts.html`: section page. Add entries by following the commented example in each file.
- `news.html`: uncensorable news and an open platform for student societies, marginalised communities and independent writers, with house rules (ideas welcome, incitement not). Add articles by following the commented example. `/blog.html` redirects here (`netlify.toml`).
- `contact.html`: contact form using Netlify Forms (no server code). Submissions appear in the Netlify dashboard under Forms; make sure form detection is enabled there. `thanks.html` is the confirmation page.

## Assets
- `assets/site.css`: all styles (light and dark mode)
- `assets/yinyang-bar.svg`: yin-yang that forms the top bar's left cap at the top of the page
- `assets/yinyang.svg`: favicon
- `assets/site.js`: sets the footer year

## Deploy
Netlify publishes the repo root as-is (`netlify.toml`). Any static host works, including one served on a Handshake name.
A strict CSP is set in `netlify.toml`, so keep scripts and styles in files: no inline `<script>`/`style=""` and no external fonts.
