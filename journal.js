/* ===================================
   BAHULEYAN.COM - Journal Logic
   =================================== */

(function initJournal() {
    const POSTS_URL = 'posts/posts.json';

    const indexView = document.getElementById('journalIndex');
    const postView = document.getElementById('journalPost');
    const errorView = document.getElementById('journalError');
    const listEl = document.getElementById('journalList');
    const tagsEl = document.getElementById('journalTags');
    const teaserEl = document.getElementById('journalTeaser');

    if (!indexView && !teaserEl) return;

    let allPosts = [];
    let activeTag = null;

    const formatDate = (iso) => {
        const d = new Date(iso + 'T00:00:00');
        if (isNaN(d)) return iso;
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const readingTime = (text) => {
        const words = text.trim().split(/\s+/).length;
        const mins = Math.max(1, Math.round(words / 220));
        return `${mins} min read`;
    };

    const renderList = (posts) => {
        if (!listEl) return;
        if (!posts.length) {
            listEl.innerHTML = '<p class="projects-empty">No entries match that tag yet.</p>';
            return;
        }
        listEl.innerHTML = posts.map(p => `
            <a class="post-card" href="journal.html?post=${encodeURIComponent(p.slug)}">
                <time class="post-date">${formatDate(p.date)}</time>
                <h3 class="post-title">${esc(p.title)}</h3>
                <p class="post-excerpt">${esc(p.excerpt || '')}</p>
                <div class="post-tags-row">
                    ${(p.tags || []).map(t => `<span class="post-tag">#${esc(t)}</span>`).join('')}
                </div>
            </a>
        `).join('');
    };

    const renderTags = (posts) => {
        if (!tagsEl) return;
        const tagSet = new Set();
        posts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
        const tags = [...tagSet].sort();
        if (!tags.length) { tagsEl.innerHTML = ''; return; }
        tagsEl.innerHTML =
            `<button class="tag-chip ${!activeTag ? 'active' : ''}" data-tag="">all</button>` +
            tags.map(t => `<button class="tag-chip ${activeTag === t ? 'active' : ''}" data-tag="${esc(t)}">#${esc(t)}</button>`).join('');

        tagsEl.querySelectorAll('.tag-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag || null;
                activeTag = tag;
                const filtered = tag ? allPosts.filter(p => (p.tags || []).includes(tag)) : allPosts;
                renderTags(allPosts);
                renderList(filtered);
            });
        });
    };

    const renderTeaser = (posts) => {
        if (!teaserEl) return;
        const latest = posts.slice(0, 2);
        if (!latest.length) {
            teaserEl.innerHTML = '<p class="projects-empty">No entries yet — first post coming soon.</p>';
            return;
        }
        teaserEl.innerHTML = latest.map(p => `
            <a class="post-card" href="journal.html?post=${encodeURIComponent(p.slug)}">
                <time class="post-date">${formatDate(p.date)}</time>
                <h3 class="post-title">${esc(p.title)}</h3>
                <p class="post-excerpt">${esc(p.excerpt || '')}</p>
            </a>
        `).join('');
    };

    const showError = (msg) => {
        if (errorView) {
            errorView.hidden = false;
            if (msg) errorView.querySelector('p').textContent = msg;
        }
        if (indexView) indexView.hidden = true;
        if (postView) postView.hidden = true;
    };

    const renderSinglePost = (post, markdown) => {
        if (!postView) return;
        indexView.hidden = true;
        postView.hidden = false;

        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postDate').textContent = `${formatDate(post.date)} · ${readingTime(markdown)}`;
        document.getElementById('postTags').innerHTML =
            (post.tags || []).map(t => `<span class="post-tag">#${esc(t)}</span>`).join('');

        const html = window.marked ? window.marked.parse(markdown) : `<pre>${esc(markdown)}</pre>`;
        document.getElementById('postBody').innerHTML = html;

        // Share link
        const shareBtn = document.getElementById('postShare');
        if (shareBtn) {
            const url = window.location.href;
            const text = `${post.title} — by @BahuleyanX`;
            shareBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        }

        document.title = `${post.title} | Journal | BAHULEYAN`;
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    // Fetch manifest
    fetch(POSTS_URL, { cache: 'no-cache' })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            allPosts = (data.posts || []).slice().sort((a, b) => b.date.localeCompare(a.date));

            // Home teaser mode
            if (teaserEl && !indexView) {
                renderTeaser(allPosts);
                return;
            }

            // Check for ?post= param for single-post view
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('post');

            if (slug) {
                const post = allPosts.find(p => p.slug === slug);
                if (!post) {
                    showError('Post not found. It may have moved or been retired.');
                    return;
                }
                return fetch(`posts/${post.file}`, { cache: 'no-cache' })
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        return res.text();
                    })
                    .then(md => renderSinglePost(post, md));
            }

            // Index view
            renderTags(allPosts);
            renderList(allPosts);

            // Also render teaser if on same page
            renderTeaser(allPosts);
        })
        .catch(() => {
            if (teaserEl && !indexView) {
                teaserEl.innerHTML = '<p class="projects-empty">Couldn\'t load journal entries right now.</p>';
                return;
            }
            showError();
        });
})();
