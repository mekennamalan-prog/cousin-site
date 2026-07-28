# Cousin — cousinmag.com

The landing page for **Cousin**, an independent print magazine about the people
and ideas making Salt Lake City interesting. It introduces the magazine,
collects subscriber emails, and gives people a way to get in touch.

**Live:** https://cousinmag.com

> Working on this with an AI agent? Read **`SKILL.md`** first — it has the full
> architecture, invariants, and gotchas. This README is the human quick-start.

## What it's made of

- **`index.html`** — the entire site. Static, self-contained, no framework, no
  build step. Just HTML + CSS + a little vanilla JS. Fonts (Fraunces + Inter
  Tight) load from Google Fonts.
- **Hosting:** GitHub Pages (repo `mekennamalan-prog/cousin-site`, `main` /
  root). The `CNAME` file points it at the custom domain.
- **Domain + DNS:** Cloudflare (`cousinmag.com`).
- **Email signups:** a Google Apps Script (`apps-script/subscribers.gs`) writes
  each address into a Google Sheet.
- **Contact inbox:** `hello@cousinmag.com` forwards to a personal inbox via
  Cloudflare Email Routing.

Total running cost: the domain (~$10–12/yr). Everything else is free.

## Repo layout

```
index.html                 The site (this is what gets served)
CNAME                       "cousinmag.com"
apps-script/subscribers.gs  The Google Sheet signup endpoint
assets/cousin-wordmark.svg  Source vector logo (by DeeJay Pasikala)
assets/cousin-profile-600.png  600x600 social avatar
SKILL.md                    Full context/working guide (read this)
README.md                   You are here
```

## Run it locally

There's no build. Open `index.html` in a browser — that's the whole site. (The
signup form will still POST to the live Google Sheet unless you blank out
`SHEET_ENDPOINT` while testing.)

## Edit & deploy

1. Edit `index.html` — colors/fonts are CSS variables in `:root` at the top;
   content is in the body; the signup logic is the `<script>` at the bottom.
2. Commit and push to `main`.
3. GitHub Pages redeploys automatically (~1 minute). Hard-refresh the site to
   clear your browser cache.

## The signup → spreadsheet flow

The form posts each email to a Google Apps Script web app, which appends a
`[timestamp, email]` row to the "Cousin subscribers" sheet.

- The endpoint URL lives in `index.html` as `SHEET_ENDPOINT`.
- The script behind it is `apps-script/subscribers.gs` (bound to the sheet via
  **Extensions → Apps Script**). Setup/redeploy notes are in that file's header.
- The request is "fire-and-forget" (`mode:"no-cors"`), so the on-screen
  "You're on the list." message always shows — **the spreadsheet is the real
  confirmation.** If rows stop appearing, first check the Apps Script
  deployment's "Who has access" is set to **Anyone**.

## Domain / HTTPS note

The Cloudflare DNS records that point the domain at GitHub Pages (four `A`
records + a `www` `CNAME`) must be **"DNS only" (grey cloud)**. Turning on
Cloudflare's proxy (orange cloud) breaks GitHub's HTTPS certificate. Don't do
it.

## Contact

`hello@cousinmag.com` (forwards to a personal inbox) · Instagram
[@cousin.mag](https://instagram.com/cousin.mag)

---

Wordmark by **DeeJay Pasikala**.
