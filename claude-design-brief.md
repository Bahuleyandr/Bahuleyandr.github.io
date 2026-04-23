# Design brief for Claude Design — bahuleyan.com

Paste this (or sections of it) into the Claude Design chat at https://claude.ai/design to give it the full context of my site before asking for any work.

---

## What the site is

Personal website for **Bahuleyan** — a passionate gamer and builder. Three pages:

1. **`index.html`** — homepage. Hero → About → Now → Games → Projects (live GitHub fetch) → Journal teaser → Connect → Arcade (Snake / Breakout / 2048 with leaderboard).
2. **`journal.html`** — markdown-driven blog. Index list view + single-post view (`?post=slug`).
3. **`uses.html`** — gear, stack, homelab.

**Live at:** https://bahuleyan.com (deployed via GitHub Pages from `Bahuleyandr/Bahuleyandr.github.io`).

---

## Hard constraints (do not break these)

- **No build step.** Vanilla HTML/CSS/JS only. No bundlers, no TypeScript, no `package.json`, no React/Vue/Svelte.
- **Two CDN scripts only:** Font Awesome 6.5 (icons) and `marked` 12 (markdown parser). Do not add more.
- **Three Google Fonts only:** `Uncial Antiqua` (display/title), `Inter` (body), `JetBrains Mono` (meta/code). Do not add more.
- **One CSS file** (`style.css`) shared across all pages. Don't split into modules.
- **Responsive breakpoints:** 768px (tablet/mobile) and 400px (small mobile).
- **Reduced motion:** all animations must be disabled under `@media (prefers-reduced-motion: reduce)`.
- **Accessibility baseline:** `aria-label` on icon-only links, `alt=""` on decorative images, `tabindex="0"` on interactive cards, semantic HTML.

---

## Current visual identity

- **Vibe:** energetic, gaming-themed, slightly cyberpunk. Oni mask logo. Glitch hero text. Floating particles. Dark editorial-arcade hybrid.
- **Mood words:** *digital realm, late-night coding, leveling up, exploration, ronin*.

---

## Design tokens (exact values)

```css
/* Colors — animated via @property + @keyframes hueShift over 120s */
--primary-hue: 270;          /* cycles 270 → 330 → 10 → 35 → 160 → 195 → 270 */
--primary-sat: 75%;
--primary:      hsl(var(--primary-hue), var(--primary-sat), 58%);
--primary-glow: hsla(var(--primary-hue), var(--primary-sat), 58%, 0.4);
--primary-dim:  hsla(var(--primary-hue), var(--primary-sat), 58%, 0.15);
--accent:       hsl(var(--primary-hue), 85%, 75%);
--card-border:  hsla(var(--primary-hue), var(--primary-sat), 58%, 0.2);

--dark-bg:        #0a0a0f;             /* page background */
--card-bg:        rgba(22, 22, 35, 0.85);
--text-color:     #e0e0e0;             /* body */
--text-secondary: #8a8a9a;             /* meta */
--text-bright:    #ffffff;             /* headings */
--danger:  #ef4444;
--success: #22c55e;

--radius: 12px;
--transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Important:** the entire site cycles its primary color hue continuously over 120 seconds. Any new component must use `var(--primary)` and friends — never hardcode a color. Canvas/SVG that wants to match calls `window.getThemeHue()` (returns the current hue number) each frame.

```css
/* Typography */
font-family: 'Inter', sans-serif;             /* body */
font-family: 'Uncial Antiqua';                /* display / hero / section H2 */
font-family: 'JetBrains Mono';                /* meta, dates, code */
```

```css
/* Layout */
nav height: 60px (fixed)
section max-width: ~1200px, padded 2rem
body has fixed background image at opacity: 0.12
particle canvas overlays everything at z-index: 0
```

---

## Sections — what exists and what each does

### Hero
Logo image → glitch H1 (`BAHULEYAN` with RGB-split text-shadow) → rotating tagline (cycles via JS) → two CTA buttons (Explore / Follow on X) → bouncing scroll-down chevron.

### About
H2 + paragraph + 3 animated stat counters (Years Gaming / Favorite Genres / Worlds Explored).

### Now
H2 + "updated April 2026" + 4 cards in a grid: Playing / Building / Reading / Listening. Each card is icon + label + value.

### Games
H2 + 3 cards in a grid (Ghost of Tsushima / Witcher 3 / Cyberpunk 2077). Each: icon + title + genre. Cards have a glow-on-hover effect.

### Projects
H2 + paragraph + grid of project cards fetched live from GitHub API (`Bahuleyandr` user, top 6 by stars). Skeleton loaders while loading. CTA button to GitHub.

### Journal teaser
H2 + paragraph + 2 most-recent post cards + CTA to full journal.

### Connect
H2 + paragraph + 4 social links in a row (X / GitHub / Steam / Discord) — each is a circle with icon and label below.

### Arcade
H2 + tabs (Snake / Breakout / 2048) + canvas + score display + start button + best score + leaderboard sidebar (Local / Global toggle).

### Footer
4 social icons + RSS + copyright with animated heart.

---

## Things that already work well — keep this energy

- The **continuous hue cycling** is the signature feature. Don't propose a static palette.
- The **glitch hero text** is iconic for this site.
- The **dark + dim background image + faint particles** combo creates depth.
- **Skeleton loaders** for async content (GitHub projects, journal teaser) feel polished.
- **Card hover glow** that follows the cursor on game cards.

## Things I want to improve

(Pick whichever apply when you take it on — be honest about which feel weakest)

1. **Hierarchy.** Section H2s might feel same-weight as everything else. The page can feel like one long scroll without strong "chapter breaks."
2. **Spacing rhythm.** I'm not sure my vertical rhythm between sections is consistent.
3. **The Now section** could be more visually distinctive — right now it's just 4 small cards.
4. **Project cards** are functional but plain — the language/topic chips, star/fork icons could be tighter.
5. **The arcade leaderboard sidebar** layout at mobile breakpoint needs review.
6. **Journal post layout** (single post view) — typography and reading width could probably be more refined for long-form reading.
7. **The "Uses" page** is the least designed of the three — could use a more interesting layout than a stacked list.

---

## What I'd love from Claude Design

### ⭐ Top priority — animated background ronin

The current background is a static, dimmed image (`background-image.webp`, opacity 0.12) of a figure in a dark suit wearing an **Oni mask** (the same mask that's in my logo). It's atmospheric but completely static.

**I want this figure to be alive.** Imagine a subtle, looping animation where the ronin:

- **Slowly draws and swings a katana** in a controlled arc — like a kata or training form, not a fight scene
- The motion should be **slow, meditative, and looping** (8–15 second cycle)
- The katana could leave a faint **trail in `var(--primary)`** as it swings — so the trail color cycles with the site's hue animation
- It should feel like he's **occupying the space**, not performing for the viewer — the user is glimpsing a moment

**Implementation constraints — this is the tricky part:**

- **Pure SVG or CSS animation** preferred. No GIF, no video, no Lottie/external library, no canvas if avoidable (canvas is OK if SVG can't get the look).
- File size budget: under 80 KB total for the character + animation.
- Must run at the same `opacity: 0.12` (or thereabouts) as the current background image — it's atmosphere, not focal point.
- Must sit behind everything (z-index 0, behind the existing particle canvas).
- **Critical:** must completely freeze (still pose) under `@media (prefers-reduced-motion: reduce)`.
- Performance: should not jank on a mid-tier phone. Aim for transform/opacity-only animations, no layout thrash.

**Style reference:** the figure should match my existing logo (`logo.png`) and current background — silhouette-heavy, dark, mysterious. Think *Ghost of Tsushima* meets *Samurai Champloo* — refined, not anime-spiky.

If a single full-character animation is too ambitious, a **sword-arm-only** animation overlaid on the existing static figure would also work — like he's idle but his blade arm moves through a slow form.

### Secondary deliverables (pick what excites you)

1. **A polished alternate hero** that keeps the glitch + Oni mask but feels less "dev portfolio template."
2. **A redesigned Now card** — more editorial, more personal feel.
3. **A redesigned project card** that uses my color tokens and looks great in the grid alongside skeleton loaders.
4. **A long-form reading layout for journal posts** — generous typography, nice pull-quotes, code block styling.
5. **A better Uses page layout** — sections for Hardware / Software / Homelab / Games — with visual interest.

For each deliverable, please:
- Use the exact CSS custom properties listed above (no hardcoded hex colors except those already in `:root`)
- Keep markup semantic and accessible
- Keep total CSS additions under ~200 lines per component
- Provide pure HTML + CSS (no JS frameworks) so I can paste into `style.css` and the relevant page

---

## Reference: live site

https://bahuleyan.com — open it to see the current state in motion (especially the hue cycling, which a static screenshot won't capture).

Repo: https://github.com/Bahuleyandr/Bahuleyandr.github.io
