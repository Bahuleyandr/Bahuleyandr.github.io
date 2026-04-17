# CLAUDE.md

Instruction manual for Claude Code when working in this repository.

## What this is

Personal static site for Bahuleyan — gaming-themed homepage, GitHub-linked projects section, markdown-based journal, and a snake game. No build step, no framework. Vanilla HTML/CSS/JS served directly by GitHub Pages.

**Live:** https://bahuleyandr.github.io/
**Deploys from:** `main` branch, root directory (GitHub Pages user site)

## Stack

- **HTML/CSS/JS** — no bundler, no framework, no dependencies to install
- **Two CDN scripts only:** Font Awesome (icons), `marked` (markdown parser for journal)
- **Google Fonts:** Uncial Antiqua (title), Inter (body), JetBrains Mono (meta/code)
- **GitHub Pages** for hosting — static, free, auto-deploys on push to `main`

## File layout

```
.
├── index.html          Homepage
├── journal.html        Journal (list view + single-post view via ?post=slug)
├── style.css           All styles (shared across both pages)
├── script.js           Shared JS: particles, nav, reveal, stats counter,
│                       snake game, GitHub repo fetch, rotating tagline, year
├── journal.js          Journal-only: manifest fetch, list render, tag filter,
│                       single-post render, home-page teaser
├── posts/
│   ├── posts.json      Manifest — array of entries (newest first is auto)
│   └── *.md            Individual entries
├── background-image.webp   Primary BG (1600×1600, ~186KB)
├── background-image.jpg    JPG fallback via CSS image-set() (~271KB)
├── favicon.png
├── logo.png
├── README.md           Public-facing intro
└── CLAUDE.md           This file
```

## Common tasks

### Add a journal entry

1. Create `posts/YYYY-MM-DD-slug.md` with a markdown body.
2. Append an object to `posts/posts.json` (at the top of the `"posts"` array):
   ```json
   {
     "slug": "your-slug",
     "title": "Your Title",
     "date": "2026-MM-DD",
     "excerpt": "One-liner shown on the index and home teaser.",
     "tags": ["gaming", "musings"],
     "file": "YYYY-MM-DD-slug.md"
   }
   ```
3. Commit + push. Pages rebuilds in ~30s. The list auto-sorts by `date` descending.

### Update the "Now" section

Edit the four `.now-card` blocks inside `#now` in `index.html`. Update `#nowUpdated` text when you change content so visitors see it's current.

### Update social links

All four (X, GitHub, Steam, Discord) are duplicated in three places — search for the URL and replace in all:
- `index.html` — hero CTA, `#connect` section, footer
- `journal.html` — footer only

### Change the games list

Edit the `.game-card` blocks inside `#games` in `index.html`. Each card uses a Font Awesome icon (see https://fontawesome.com/icons).

### Change the GitHub projects section

The username is hardcoded at `script.js` top of the `initGitHubProjects` IIFE (`const username = 'Bahuleyandr'`). Changing it changes the API call and all links.

### Change the rotating taglines

Edit the `taglines` array inside `initTagline` in `script.js`.

### Local preview

`file://` won't work — `fetch()` for `posts.json` and markdown files is blocked. Use a local HTTP server:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

## Conventions

- **No build step.** Don't introduce bundlers, TypeScript, or package.json. Edit files, commit, push.
- **No client-side routing libraries.** The journal uses a URL query param (`?post=slug`) parsed directly in `journal.js`.
- **Colors** live in `:root` custom properties at the top of `style.css`. Primary purple is `#9f46e4`. Change once, propagates everywhere.
- **Reveal-on-scroll** — sections get `class="reveal"` and an IntersectionObserver adds `.visible`. Apply to any new section that should fade in.
- **Responsive breakpoints:** `768px` (tablet/mobile) and `400px` (small mobile). Keep both in mind when adding layouts.
- **Reduced motion:** animations are disabled under `prefers-reduced-motion: reduce` — preserve this when adding new animations.
- **Accessibility:** keep `aria-label` on icon-only links, `alt=""` on decorative images, and `tabindex="0"` on interactive cards.

## Deployment

GitHub Pages auto-deploys on push to `main`. Check build status:

```bash
gh api repos/Bahuleyandr/Bahuleyandr.github.io/pages/builds/latest
```

A `"status":"built"` means it's live. `"errored"` with a message means a build failure — usually a malformed `posts.json` or Jekyll trying to parse something (we're not using Jekyll here; if that becomes an issue, add an empty `.nojekyll` file at the root).

## Custom domain

When ready to point `bahuleyan.com` (or similar) at the site:

1. Add a `CNAME` file at repo root containing just the bare domain (e.g. `bahuleyan.com`).
2. At your DNS registrar, set these A records for apex:
   - `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Plus a `CNAME` record for `www` → `bahuleyandr.github.io`
3. In the repo Settings → Pages, enter the domain and enable HTTPS once the cert provisions (~10 min).

## Things to not do

- Don't commit `background-image.jpg` if you re-optimize — replace in place, don't add versioned copies.
- Don't inline the markdown content in `posts.json` — keep the manifest light, content in `.md` files.
- Don't break the `posts/posts.json` format — a parse failure takes down the entire journal section (graceful fallback exists but looks like a bug).
- Don't wire up tracking scripts, analytics, or fonts that aren't already loaded without saying so — the site is intentionally dependency-light.
