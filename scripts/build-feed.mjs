#!/usr/bin/env node
/**
 * Generate feed.xml (Atom) and sitemap.xml from posts/posts.json + the matching
 * markdown bodies. Both files are regenerated together so they stay in sync.
 *
 * Run before each release (or wire up as a GitHub Action):
 *   node scripts/build-feed.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SITE_URL = 'https://bahuleyan.com';
const AUTHOR = 'Bahuleyan';
const FEED_TITLE = 'Bahuleyan — Journal';
const FEED_SUBTITLE = 'Musings on games, code, and the in-between.';

const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

async function loadPosts() {
    const manifest = JSON.parse(await readFile(join(ROOT, 'posts', 'posts.json'), 'utf8'));
    const posts = (manifest.posts || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    return Promise.all(posts.map(async (p) => {
        const body = await readFile(join(ROOT, 'posts', p.file), 'utf8');
        return { ...p, body };
    }));
}

function buildAtom(posts) {
    const updated = posts.length
        ? new Date(posts[0].date + 'T00:00:00Z').toISOString()
        : new Date().toISOString();

    const entries = posts.map(p => {
        const url = `${SITE_URL}/journal.html?post=${encodeURIComponent(p.slug)}`;
        return `    <entry>
        <title>${esc(p.title)}</title>
        <link rel="alternate" type="text/html" href="${url}"/>
        <id>${url}</id>
        <updated>${new Date(p.date + 'T00:00:00Z').toISOString()}</updated>
        <published>${new Date(p.date + 'T00:00:00Z').toISOString()}</published>
        <summary>${esc(p.excerpt || '')}</summary>
        <author><name>${esc(AUTHOR)}</name></author>
        ${(p.tags || []).map(t => `<category term="${esc(t)}"/>`).join('\n        ')}
        <content type="text">${esc(p.body)}</content>
    </entry>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${esc(FEED_TITLE)}</title>
    <subtitle>${esc(FEED_SUBTITLE)}</subtitle>
    <link rel="alternate" type="text/html" href="${SITE_URL}/journal.html"/>
    <link rel="self" type="application/atom+xml" href="${SITE_URL}/feed.xml"/>
    <id>${SITE_URL}/</id>
    <updated>${updated}</updated>
    <author><name>${esc(AUTHOR)}</name></author>
    <rights>© ${new Date().getFullYear()} ${esc(AUTHOR)}</rights>
${entries}
</feed>
`;
}

function buildSitemap(posts) {
    const today = new Date().toISOString().slice(0, 10);
    const staticUrls = [
        { loc: `${SITE_URL}/`,             changefreq: 'weekly',  priority: '1.0' },
        { loc: `${SITE_URL}/journal.html`, changefreq: 'weekly',  priority: '0.8' },
        { loc: `${SITE_URL}/uses.html`,    changefreq: 'monthly', priority: '0.6' }
    ];

    const staticBlock = staticUrls.map(u =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    ).join('\n');

    const postBlock = posts.map(p =>
        `  <url>\n    <loc>${SITE_URL}/journal.html?post=${encodeURIComponent(p.slug)}</loc>\n    <lastmod>${p.date}</lastmod>\n    <priority>0.5</priority>\n  </url>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticBlock}
${postBlock}
</urlset>
`;
}

const posts = await loadPosts();
const xml = buildAtom(posts);
await writeFile(join(ROOT, 'feed.xml'), xml, 'utf8');
console.log(`feed.xml written — ${posts.length} entries`);

const sitemap = buildSitemap(posts);
await writeFile(join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
console.log(`sitemap.xml written — ${posts.length + 3} URLs`);
