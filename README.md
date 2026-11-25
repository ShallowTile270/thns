# Handshake App Hub

A community directory where builders post their Handshake apps/dApps and newcomers browse them.
Plain HTML/CSS/JS frontend + Netlify Functions with Netlify Blobs storage. No build step.

## Deploy (Netlify)
1. Push this repo to GitHub and import it in Netlify (publish dir `.`, functions `netlify/functions` — already in `netlify.toml`).
2. Site settings → Environment variables → add `ADMIN_TOKEN` (a long random string).
3. Deploy. Visit `/admin.html`, enter the token, and approve submissions.

## How it works
- `/submit.html` → `POST /api/submit` stores a **pending** listing (validation, honeypot, 3 submissions/hour/IP).
- `/admin.html` lists everything; approve / reject / feature / delete (Bearer `ADMIN_TOKEN`).
- Approved apps show on `/`, `/browse.html`, `/app.html?id=…`; upvotes dedupe per IP.
- Until a real listing is approved, labeled sample listings from `assets/seed.json` are shown. Edit or delete that file freely.

## Local dev
```bash
npm install
ADMIN_TOKEN=test npx netlify dev
```
(Opening files with a plain static server works too, but shows only sample data.)

## Notes
- Strict CSP is set in `netlify.toml` (no inline scripts/styles, same-origin fetches). Screenshots may be any https image.
- All user content is rendered via `textContent`; links are restricted to http(s) with `rel="noopener noreferrer nofollow"`.
- The homepage (`index.html`) is the Tendo landing page (classic Apple-style, red-pill logo) linking to `/videos.html`, `/blog.html`, `/podcasts.html`, `/news.html`. Add entries to those pages by following the commented example in each. Shared styles: `assets/site.css`; logo: `assets/redpill.svg`.
- The app directory lives at `/browse.html`, `/submit.html`.
- To host the same files on a Handshake name, point it at the Netlify site; relative `/…` paths work from the site root.
