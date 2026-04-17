/* ===================================
   BAHULEYAN.COM - Merged Script
   =================================== */

// ---- Theme Helper ----
// Reads the animated --primary-hue custom property so canvas rendering
// (particles, games) can stay in sync with the CSS hue-cycle animation.
window.getThemeHue = function () {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--primary-hue');
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 270;
};
window.themeColor = function (lightness = 58, alpha = 1) {
    return `hsla(${window.getThemeHue()}, 75%, ${lightness}%, ${alpha})`;
};


// ---- Particle Background System ----
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.pulse = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += 0.02;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw(hue) {
            const alpha = this.opacity + Math.sin(this.pulse) * 0.15;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 75%, 58%, ${Math.max(0, alpha)})`;
            ctx.fill();
        }
    }

    const count = window.innerWidth < 768 ? 40 : 80;
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function drawConnections(hue) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `hsla(${hue}, 75%, 58%, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        const hue = window.getThemeHue();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(hue); });
        drawConnections(hue);
        requestAnimationFrame(animate);
    }
    animate();
})();


// ---- Navbar Scroll + Mobile Toggle + Active Section ----
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const isOpen = links.classList.toggle('open');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', isOpen);
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                links.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navItems.forEach(a => a.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -60% 0px' });

    sections.forEach(section => observer.observe(section));
})();


// ---- Scroll Reveal Animations ----
(function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => observer.observe(el));
})();


// ---- Rotating Tagline ----
(function initTagline() {
    const el = document.getElementById('rotatingTagline');
    if (!el) return;
    const taglines = [
        'Leveling up one game at a time.',
        'Shipping code. Slaying dragons.',
        'Exploring vast digital worlds.',
        'Building things. Breaking things. Repeating.',
        'Adventurer. Tinkerer. Perpetual noob.'
    ];
    let i = 0;
    setInterval(() => {
        i = (i + 1) % taglines.length;
        el.style.opacity = 0;
        setTimeout(() => {
            el.textContent = taglines[i];
            el.style.opacity = 1;
        }, 400);
    }, 4500);
    el.style.transition = 'opacity 0.4s ease';
})();


// ---- Animated Stat Counters ----
(function initStats() {
    const stats = document.querySelectorAll('.stat-value[data-count]');
    if (!stats.length) return;

    const animate = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + (progress === 1 ? suffix : '');
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(s => observer.observe(s));
})();


// ---- GitHub Projects ----
(function initGitHubProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const username = 'Bahuleyandr';
    const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;

    const langColors = {
        JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
        Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', HTML: '#e34c26',
        CSS: '#563d7c', C: '#555555', 'C++': '#f34b7d', 'C#': '#178600',
        Shell: '#89e051', Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138',
        Kotlin: '#A97BFF', Dart: '#00B4AB', Lua: '#000080', Vue: '#41b883',
        Svelte: '#ff3e00'
    };

    const renderEmpty = (msg) => {
        grid.innerHTML = `<p class="projects-empty">${msg}</p>`;
    };

    const renderRepos = (repos) => {
        if (!repos.length) {
            renderEmpty('No public repos yet — check back soon!');
            return;
        }
        const visible = repos
            .filter(r => !r.fork)
            .slice(0, 6);

        if (!visible.length) {
            renderEmpty('No public repos yet — check back soon!');
            return;
        }

        grid.innerHTML = visible.map(r => {
            const lang = r.language || '—';
            const color = langColors[lang] || '#9f46e4';
            const desc = r.description
                ? r.description.replace(/</g, '&lt;').replace(/>/g, '&gt;')
                : 'No description provided.';
            const stars = r.stargazers_count || 0;
            const forks = r.forks_count || 0;
            return `
                <a class="project-card" href="${r.html_url}" target="_blank" rel="noopener noreferrer">
                    <div class="project-header">
                        <i class="fas fa-folder-open"></i>
                        <span>${r.name}</span>
                    </div>
                    <p class="project-desc">${desc}</p>
                    <div class="project-meta">
                        <span><span class="lang-dot" style="background:${color}"></span>${lang}</span>
                        <span><i class="fas fa-star"></i> ${stars}</span>
                        <span><i class="fas fa-code-branch"></i> ${forks}</span>
                    </div>
                </a>
            `;
        }).join('');
    };

    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(renderRepos)
        .catch(() => {
            renderEmpty(`Couldn't reach GitHub right now. <a class="inline-link" href="https://github.com/${username}" target="_blank" rel="noopener noreferrer">Visit profile &rarr;</a>`);
        });
})();


// ---- Current Year in Footer ----
(function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

