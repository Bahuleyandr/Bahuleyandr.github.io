/* ===================================
   BAHULEYAN.COM - Merged Script
   =================================== */

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
        draw() {
            const alpha = this.opacity + Math.sin(this.pulse) * 0.15;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(159, 70, 228, ${Math.max(0, alpha)})`;
            ctx.fill();
        }
    }

    const count = window.innerWidth < 768 ? 40 : 80;
    for (let i = 0; i < count; i++) particles.push(new Particle());

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(159, 70, 228, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
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


// ---- Snake Game (Enhanced) ----
(function initSnakeGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const gameButton = document.getElementById('gameButton');
    const overlay = document.getElementById('gameOverlay');
    const overlayText = overlay ? overlay.querySelector('.overlay-text') : null;

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let highScore = 0;
    let gameLoop = null;
    let gameRunning = false;
    let speed = 120;
    let foodParticles = [];

    // Restore high score from localStorage
    try {
        const saved = localStorage.getItem('bahuleyan_snake_hiscore');
        if (saved) {
            highScore = parseInt(saved, 10) || 0;
            if (highScoreEl) highScoreEl.textContent = highScore;
        }
    } catch (_) { /* ignore */ }

    class FoodParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = (Math.random() - 0.5) * 6;
            this.life = 1;
            this.size = Math.random() * 3 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= 0.04;
            this.vx *= 0.97;
            this.vy *= 0.97;
        }
        draw() {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(159, 70, 228, ${this.life})`;
            ctx.fill();
        }
    }

    function spawnFoodParticles(x, y) {
        for (let i = 0; i < 12; i++) {
            foodParticles.push(new FoodParticle(
                x * gridSize + gridSize / 2,
                y * gridSize + gridSize / 2
            ));
        }
    }

    function resetGame() {
        const mid = Math.floor(tileCount / 2);
        snake = [
            { x: mid, y: mid },
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid }
        ];
        dx = 1;
        dy = 0;
        score = 0;
        speed = 120;
        foodParticles = [];
        updateScore();
        placeFood();
    }

    function placeFood() {
        let valid = false;
        while (!valid) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            valid = !snake.some(seg => seg.x === food.x && seg.y === food.y);
        }
    }

    function updateScore() {
        if (scoreEl) scoreEl.textContent = score;
    }

    function drawGame() {
        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(159, 70, 228, 0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        foodParticles = foodParticles.filter(p => p.life > 0);
        foodParticles.forEach(p => { p.update(); p.draw(); });

        const foodCenterX = food.x * gridSize + gridSize / 2;
        const foodCenterY = food.y * gridSize + gridSize / 2;

        const glow = ctx.createRadialGradient(foodCenterX, foodCenterY, 0, foodCenterX, foodCenterY, gridSize);
        glow.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(food.x * gridSize - gridSize / 2, food.y * gridSize - gridSize / 2, gridSize * 2, gridSize * 2);

        ctx.beginPath();
        ctx.arc(foodCenterX, foodCenterY, gridSize / 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.shadowBlur = 0;

        snake.forEach((segment, index) => {
            const ratio = 1 - (index / snake.length) * 0.6;
            const r = Math.round(159 * ratio);
            const g = Math.round(70 * ratio);
            const b = Math.round(228 * ratio);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

            const padding = index === 0 ? 1 : 2;
            const radius = index === 0 ? 5 : 3;
            const sx = segment.x * gridSize + padding;
            const sy = segment.y * gridSize + padding;
            const sw = gridSize - padding * 2;
            const sh = gridSize - padding * 2;

            ctx.beginPath();
            ctx.moveTo(sx + radius, sy);
            ctx.arcTo(sx + sw, sy, sx + sw, sy + sh, radius);
            ctx.arcTo(sx + sw, sy + sh, sx, sy + sh, radius);
            ctx.arcTo(sx, sy + sh, sx, sy, radius);
            ctx.arcTo(sx, sy, sx + sw, sy, radius);
            ctx.closePath();
            ctx.fill();

            if (index === 0) {
                ctx.shadowColor = 'rgba(159, 70, 228, 0.5)';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return gameOver();
        }
        if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            return gameOver();
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            updateScore();
            spawnFoodParticles(food.x, food.y);
            placeFood();
            if (speed > 60) speed -= 2;
        } else {
            snake.pop();
        }
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        gameLoop = null;

        if (score > highScore) {
            highScore = score;
            if (highScoreEl) highScoreEl.textContent = highScore;
            try { localStorage.setItem('bahuleyan_snake_hiscore', highScore); } catch (_) {}
        }

        if (gameButton) gameButton.textContent = 'Play Again';

        if (overlay && overlayText) {
            overlayText.textContent = `Game Over! Score: ${score}`;
            overlay.classList.remove('hidden');
        }
    }

    function tick() {
        moveSnake();
        if (gameRunning) drawGame();
    }

    function startGame() {
        if (gameRunning) return;
        resetGame();
        gameRunning = true;

        if (overlay) overlay.classList.add('hidden');
        if (gameButton) gameButton.textContent = 'Restart';

        drawGame();
        gameLoop = setInterval(tick, speed);
    }

    function restartGame() {
        clearInterval(gameLoop);
        gameLoop = null;
        gameRunning = false;
        startGame();
    }

    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                if (dy !== 1) { dx = 0; dy = -1; }
                e.preventDefault();
                break;
            case 'ArrowDown': case 's': case 'S':
                if (dy !== -1) { dx = 0; dy = 1; }
                e.preventDefault();
                break;
            case 'ArrowLeft': case 'a': case 'A':
                if (dx !== 1) { dx = -1; dy = 0; }
                e.preventDefault();
                break;
            case 'ArrowRight': case 'd': case 'D':
                if (dx !== -1) { dx = 1; dy = 0; }
                e.preventDefault();
                break;
        }
    });

    if (gameButton) {
        gameButton.addEventListener('click', () => {
            if (gameRunning) restartGame();
            else startGame();
        });
    }

    resetGame();
    drawGame();
})();
