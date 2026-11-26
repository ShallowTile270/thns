# Tendo

Tendo's static site on Handshake: a landing page plus Videos, Blog, Podcasts and News.
Plain HTML/CSS (one tiny optional JS file). No build step, no server code.

## Pages
- `index.html`: landing page (title, "Welcome to Handshake.", section links, Explore tiles)
- `index.html` and `videos.html` embed a hand-ordered list of @tendo442 YouTube videos with Previous/Next buttons. The order is set by the iframe `src` in both files: `embed/FIRST_ID?playlist=FIRST_ID,SECOND_ID,...`. The first ID must appear twice (path and start of `playlist`), or YouTube skips it. **When you upload a new video, add its ID to both files.** (Channel `UCSDpNNaWg1M6WWF0fqwLyTg`; to auto-update instead, swap in `embed/videoseries?list=UUSDpNNaWg1M6WWF0fqwLyTg` for newest-first, or the `list=` ID of a YouTube playlist you order yourself.) The buttons talk to the player via postMessage in `assets/site.js`; `netlify.toml` allows frames from `www.youtube-nocookie.com` only.
- `podcasts.html`, `news.html`: section pages. Add entries by following the commented example in each file.
- `blog.html`: an open platform for student societies, marginalised communities and independent writers. It includes the house rules: ideas are welcome, incitement is not.
- `contact.html`: contact form using Netlify Forms (no server code). Submissions appear in the Netlify dashboard under Forms; make sure form detection is enabled there. `thanks.html` is the confirmation page.

## Assets
- `assets/site.css`: all styles (light and dark mode)
- `assets/redpill.svg`: logo and favicon
- `assets/site.js`: sets the footer year

## Deploy
Netlify publishes the repo root as-is (`netlify.toml`). Any static host works, including one served on a Handshake name.
A strict CSP is set in `netlify.toml`, so keep scripts and styles in files: no inline `<script>`/`style=""` and no external fonts.
