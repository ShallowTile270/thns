# Tendo

Tendo's static site on Handshake: a landing page plus Videos, Blog, Podcasts and News.
Plain HTML/CSS (one tiny optional JS file). No build step, no server code.

## Pages
- `index.html`: landing page (title, "Welcome to Handshake.", section links, Explore tiles)
- `videos.html`, `podcasts.html`, `news.html`: section pages. Add entries by following the commented example in each file.
- `blog.html`: an open platform for student societies, marginalised communities and independent writers. It includes the house rules: ideas are welcome, incitement is not.
- `contact.html`: contact form using Netlify Forms (no server code). Submissions appear in the Netlify dashboard under Forms; make sure form detection is enabled there. `thanks.html` is the confirmation page.

## Assets
- `assets/site.css`: all styles (light and dark mode)
- `assets/redpill.svg`: logo and favicon
- `assets/site.js`: sets the footer year

## Deploy
Netlify publishes the repo root as-is (`netlify.toml`). Any static host works, including one served on a Handshake name.
A strict CSP is set in `netlify.toml`, so keep scripts and styles in files: no inline `<script>`/`style=""` and no external fonts.
