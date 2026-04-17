# bahuleyan.com

Personal site — gaming, projects, and the occasional journal entry.

Live at [bahuleyandr.github.io](https://bahuleyandr.github.io).

## Structure

```
.
├── index.html          Homepage (hero, now, games, projects, journal teaser, connect, snake)
├── journal.html        Journal index + single-post view
├── style.css           Shared styles
├── script.js           Shared JS (particles, nav, reveal, stats, snake, github fetch)
├── journal.js          Journal rendering (markdown + manifest)
├── posts/
│   ├── posts.json      Manifest of all entries
│   └── *.md            Individual entries
├── background-image.webp / .jpg
├── favicon.png
└── logo.png
```

## Adding a journal entry

1. Create `posts/YYYY-MM-DD-slug.md`
2. Append an entry to `posts/posts.json`:
   ```json
   {
     "slug": "your-slug",
     "title": "Your Title",
     "date": "2026-MM-DD",
     "excerpt": "Short teaser shown on the index.",
     "tags": ["gaming"],
     "file": "YYYY-MM-DD-slug.md"
   }
   ```
3. Commit + push. GitHub Pages redeploys automatically.

## Local preview

Because the site fetches JSON/markdown, open via a local HTTP server (not `file://`):

```bash
python -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`.
