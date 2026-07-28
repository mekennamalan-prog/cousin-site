---
name: cousin-site
description: >-
  Working context for the Cousin magazine website (https://cousinmag.com) — a
  static single-page landing site on GitHub Pages with a Google-Sheets-backed
  email signup and Cloudflare email forwarding. Consult this whenever editing,
  deploying, debugging, or extending the Cousin site in any way: the landing
  page, the COUSIN wordmark, the signup form, the color/design system, the
  domain/DNS, or the hello@ inbox. Read it before touching index.html so you
  don't break the invariants (single-file layout, CSS-mask wordmark, no-cors
  form post, Cloudflare-proxy-off DNS).
---

# Cousin — site working guide

Cousin is an independent print magazine about the people and ideas making Salt
Lake City interesting. This repo is its **pre-launch landing page**: one page
that states what Cousin is, collects subscriber emails, and points people to a
contact address. No articles or CMS yet — that's a "future you" concern.

Live at **https://cousinmag.com**.

## The whole stack in one breath

Static `index.html` → committed to a **GitHub Pages** repo → served at
**cousinmag.com** (domain + DNS on **Cloudflare**). The signup box POSTs each
email to a **Google Apps Script** web app that appends it to a **Google Sheet**.
Mail to **hello@cousinmag.com** is forwarded to a personal Gmail via
**Cloudflare Email Routing**. No backend, no build step, no framework, no
monthly cost beyond the domain.

## Files

```
cousin-site/
├── index.html                 # the entire production site (self-contained)
├── CNAME                       # "cousinmag.com" — tells GitHub Pages the custom domain
├── apps-script/
│   └── subscribers.gs          # Apps Script bound to the Google Sheet (the signup endpoint)
└── assets/
    ├── cousin-wordmark.svg      # source vector of the COUSIN logo (by DeeJay Pasikala)
    └── cousin-profile-600.png   # 600x600 blue-on-cream social avatar
```

`index.html` is the only file GitHub Pages actually serves. `apps-script/` and
`assets/` are kept in the repo for reference/version control; the wordmark is
**embedded** in the HTML (see below), not linked from `assets/`.

## How each piece works

### Hosting — GitHub Pages
- Repo: `mekennamalan-prog/cousin-site`, branch `main`, folder `/ (root)`.
- Pages serves the root `index.html`. The `CNAME` file pins the custom domain.
- Deploy = push to `main`; Pages rebuilds in ~1 min. Hard-refresh to bust cache.

### Domain / DNS — Cloudflare
- `cousinmag.com` is registered AND DNS-managed at Cloudflare.
- Records that point the domain at GitHub Pages:
  - Four `A` records on `@` → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
  - One `CNAME` on `www` → `mekennamalan-prog.github.io`
- **INVARIANT:** these five records must be **"DNS only" (grey cloud, proxy
  OFF)**. If Cloudflare's orange-cloud proxy is on, GitHub can't issue the TLS
  cert and HTTPS breaks. This is the #1 gotcha.

### Signup capture — Google Sheet via Apps Script
- The visible cream/blue form (input `#email`, button `#submit`, status
  `#status`) is plain HTML/JS — NOT a third-party embed.
- On submit, `index.html` does:
  `fetch(SHEET_ENDPOINT, { method:"POST", mode:"no-cors", body:new URLSearchParams({email}) })`
- `SHEET_ENDPOINT` (constant near the bottom of `index.html`) is the Apps
  Script `/exec` URL. `apps-script/subscribers.gs` is the code behind it; it
  appends `[timestamp, email]` to the sheet.
- **`no-cors` = fire-and-forget.** Apps Script returns no CORS headers, so the
  browser can't read the response. The success message is shown optimistically
  and is NOT proof of success — **the Google Sheet row is the source of truth.**
- If the Apps Script is **redeployed as a new deployment**, its URL changes →
  update `SHEET_ENDPOINT` in `index.html`. (Use "Manage deployments → Edit →
  New version" to keep the same URL.)

### Contact inbox — Cloudflare Email Routing
- `hello@cousinmag.com` forwards to a personal Gmail (receive-only; replies go
  out from the personal address, which is fine for now).
- Cloudflare added MX + DKIM/SPF records (status shows "Locked" = protected).
- This is a **separate DNS lane** from the website records — don't touch the MX/
  TXT records when editing the GitHub Pages A/CNAME records.

## Design system (all tokens live in `:root` at the top of index.html)

- **Palette:** `--bg` cream `#F2ECDD`, `--wordmark` blue `#2A6AF2`, `--text`
  ink `#17140D`. Footer is an ink band with cream text; the contact line is
  blue for a pop.
- **Type:** **Fraunces** (editorial serif — tagline, footer quote) + **Inter
  Tight** (UI/labels), both from Google Fonts.
- **Layout:** centered hero (kicker → wordmark → tagline → signup) then an ink
  footer (contact → Twain quote → wordmark + Instagram icon → base line).
  Everything is centered except nothing now (contact moved into the footer).
- **Motion:** load-in reveal on hero elements; respects
  `prefers-reduced-motion`. Film-grain overlay via an inline SVG data URI.
- **Copy currently in place:**
  - Kicker: `Coming soon — Issue 01`
  - Tagline: `COUSIN is an independent print magazine that widens the lens on
    the people and ideas that make Salt Lake City interesting.` (a
    `<br class="db">` forces two lines on desktop; hidden on mobile)
  - Footer contact: `Say hi, send us a pitch: hello@cousinmag.com`
  - Footer quote: a genuine Mark Twain passage from *Roughing It* (1872) that
    includes "the pleasant strangeness of a city…" — Twain describing SLC.
  - Base line: `This is the place or whatever` + `© 2026 Cousin Magazine`

### The COUSIN wordmark (important, non-obvious)
The logo is **not an `<img>`**. It's rendered with a **CSS mask** so its color
is controlled by CSS:
- The source SVG (`assets/cousin-wordmark.svg`) is embedded in `index.html` as a
  `-webkit-mask-image` / `mask-image` data URI on elements with class
  `wm-mask`.
- The element's `background-color` shows through the mask → the wordmark's color
  IS `var(--wordmark)` (hero) or `var(--cream)` (footer). Change one token,
  recolor the logo.
- `aspect-ratio` on `.wm-mask` matches the SVG viewBox (`274.42 / 66.84`). If you
  swap the logo, update both the mask data URI and the aspect-ratio.

## Editing & deploy workflow (now that it's in VS Code)
1. Edit `index.html` (design tokens up top; content in the body; JS at the
   bottom).
2. `git commit` + `git push` to `main`.
3. GitHub Pages redeploys in ~1 min; hard-refresh cousinmag.com.
Keep it a single self-contained `index.html`. If you refactor into partials/a
build step, ensure the deployed output is still a root `index.html` that Pages
serves, and that `CNAME` survives the build.

## Invariants — don't break these
- **Single-file, no-build** unless you deliberately add a Pages-compatible build.
- **Cloudflare proxy OFF** (DNS only) for the GitHub A/CNAME records.
- **Wordmark stays a CSS mask** colored by `var(--wordmark)` (don't hardcode a
  fill or drop in a colored raster).
- **Form element IDs**: `#email`, `#submit`, `#status` — the JS depends on them.
- **`SHEET_ENDPOINT` must match the live Apps Script deployment.**
- **Public repo** → put no secrets in it. The Sheet endpoint is a public write
  URL (that's expected); if it ever gets spammed, add validation / a honeypot /
  rate limiting in `subscribers.gs`.

## History (so you don't reintroduce dead ends)
Email capture went Supabase (demo) → Kit/ConvertKit (abandoned: confirmation
emails landed in spam, and Kit's form endpoint rejected raw browser POSTs) →
**Google Sheets via Apps Script (current, working).** Don't wire the form back
to Supabase or Kit. When Cousin eventually needs to *send* to the list
(announcing Issue 01), export the sheet into an email tool then — that's a
future decision, not part of this site.

## Roadmap / nice-to-haves (not started)
- Background photo in the hero (tokens + a legibility overlay make this easy).
- Decide whether to keep the `© 2026 Cousin Magazine` base line or drop it.
- "About / Staff" pages if/when the magazine grows past one page.
- An email/newsletter tool for sending (export the sheet into it when needed).

## Credits
Wordmark by **DeeJay Pasikala**. Brand direction, palette, and this site
built with the owner (Mekenna Malan / Cousin) over an iterative chat session.
