/* ===================================
   BAHULEYAN.COM - Arcade
   Snake, Breakout, 2048 + local + optional global leaderboard
   =================================== */

(function initArcade() {
    const canvas = document.getElementById('gameCanvas');
    const gameDom = document.getElementById('gameDom');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const gameButton = document.getElementById('gameButton');
    const overlay = document.getElementById('gameOverlay');
    const overlayText = overlay ? overlay.querySelector('.overlay-text') : null;
    const gameHint = document.getElementById('gameHint');
    const tabs = document.querySelectorAll('.arcade-tab');
    const leaderboardList = document.getElementById('leaderboardList');
    const leaderboardTitle = document.getElementById('leaderboardTitle');
    const modeLocalBtn = document.getElementById('lbModeLocal');
    const modeGlobalBtn = document.getElementById('lbModeGlobal');
    const leaderboardNote = document.getElementById('leaderboardNote');

    if (!canvas || !tabs.length) return;
    const ctx = canvas.getContext('2d');

    const hue = () => (window.getThemeHue ? window.getThemeHue() : 270);
    const color = (l, a = 1) => `hsla(${hue()}, 75%, ${l}%, ${a})`;

    // -------------------- Config --------------------
    const API = (window.ARCADE_API || '').replace(/\/$/, '') || null;
    let mode = API ? 'global' : 'local';

    // -------------------- Leaderboard (local + optional global) --------------------
    const esc = (s) => String(s).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    const Local = {
        key(g) { return `bahuleyan_arcade_${g}`; },
        load(g) {
            try {
                const raw = localStorage.getItem(this.key(g));
                return raw ? JSON.parse(raw) : [];
            } catch (_) { return []; }
        },
        save(g, entries) {
            try { localStorage.setItem(this.key(g), JSON.stringify(entries.slice(0, 10))); } catch (_) {}
        },
        best(g) {
            const arr = this.load(g);
            return arr.length ? arr[0].score : 0;
        },
        add(g, entry) {
            const arr = this.load(g);
            arr.push(entry);
            arr.sort((a, b) => b.score - a.score);
            this.save(g, arr);
        },
        qualifies(g, score) {
            if (score <= 0) return false;
            const arr = this.load(g);
            if (arr.length < 10) return true;
            return score > arr[arr.length - 1].score;
        }
    };

    const Global = {
        cache: {},
        best(g) {
            const cached = this.cache[g];
            return (cached && cached.scores && cached.scores[0]) ? cached.scores[0].score : 0;
        },
        async fetchTop(g) {
            if (!API) return [];
            try {
                const res = await fetch(`${API}/scores/${g}`, { cache: 'no-cache' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                this.cache[g] = { scores: data.scores || [], fetchedAt: Date.now() };
                return this.cache[g].scores;
            } catch (e) {
                console.warn('[arcade] global fetch failed:', e.message);
                return null; // null = couldn't fetch (different from "empty")
            }
        },
        async submit(g, score, name) {
            if (!API) return null;
            try {
                const res = await fetch(`${API}/scores/${g}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, score })
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                this.cache[g] = { scores: data.scores || [], fetchedAt: Date.now() };
                return data;
            } catch (e) {
                console.warn('[arcade] global submit failed:', e.message);
                return null;
            }
        }
    };

    function renderEntries(entries, opts = {}) {
        if (!leaderboardList) return;
        if (opts.unreachable) {
            leaderboardList.innerHTML = '<li class="leaderboard-empty">Offline — showing local only.</li>';
            return;
        }
        if (!entries || !entries.length) {
            leaderboardList.innerHTML = '<li class="leaderboard-empty">No scores yet — play a round.</li>';
            return;
        }
        leaderboardList.innerHTML = entries.map((e, i) => `
            <li class="leaderboard-entry${i === 0 ? ' is-top' : ''}">
                <span class="lb-rank">${i + 1}</span>
                <span class="lb-name">${esc(e.name || 'Anon')}</span>
                <span class="lb-score">${(e.score || 0).toLocaleString()}</span>
            </li>
        `).join('');
    }

    async function renderBoard(game) {
        if (!leaderboardList) return;
        if (leaderboardTitle) leaderboardTitle.textContent = mode === 'global' ? 'Global Top 10' : 'Local Top 10';
        if (leaderboardNote) {
            leaderboardNote.textContent = mode === 'global'
                ? 'Shared with everyone who plays.'
                : 'Saved in your browser only.';
        }
        if (mode === 'global') {
            // show cached or loading
            if (Global.cache[game]) {
                renderEntries(Global.cache[game].scores);
            } else {
                renderEntries([], {});
                leaderboardList.innerHTML = '<li class="leaderboard-empty leaderboard-loading">Loading…</li>';
            }
            const fresh = await Global.fetchTop(game);
            if (fresh === null) renderEntries(null, { unreachable: true });
            else renderEntries(fresh);
        } else {
            renderEntries(Local.load(game));
        }
        updateBest(game);
    }

    function updateBest(game) {
        if (!highScoreEl) return;
        const localBest = Local.best(game);
        const globalBest = mode === 'global' ? Global.best(game) : 0;
        // Always show the user's personal best — global top is already visible in the board
        highScoreEl.textContent = Math.max(localBest, globalBest).toLocaleString();
    }

    async function handleScore(game, score) {
        if (score <= 0) { updateBest(game); return; }

        const localQualifies = Local.qualifies(game, score);
        let name = null;

        if (localQualifies) {
            name = (prompt(`New best: ${score.toLocaleString()}! Your name?`, 'Anon') || 'Anon').trim().slice(0, 12) || 'Anon';
            Local.add(game, { name, score, date: new Date().toISOString().slice(0, 10) });
        }

        if (API) {
            // Submit to global if we have a name (either just prompted, or reuse last-used)
            if (!name) name = (localStorage.getItem('bahuleyan_arcade_name') || 'Anon').slice(0, 12);
            if (name) {
                localStorage.setItem('bahuleyan_arcade_name', name);
                await Global.submit(game, score, name);
            }
        }

        await renderBoard(game);
    }

    function bindModeToggle() {
        if (!modeLocalBtn || !modeGlobalBtn) return;
        if (!API) {
            modeGlobalBtn.setAttribute('disabled', '');
            modeGlobalBtn.title = 'Global leaderboard not configured';
        }
        const setMode = (m) => {
            mode = m;
            modeLocalBtn.classList.toggle('active', m === 'local');
            modeGlobalBtn.classList.toggle('active', m === 'global');
            renderBoard(current);
        };
        modeLocalBtn.addEventListener('click', () => setMode('local'));
        modeGlobalBtn.addEventListener('click', () => { if (API) setMode('global'); });
        // Reflect initial state
        modeLocalBtn.classList.toggle('active', mode === 'local');
        modeGlobalBtn.classList.toggle('active', mode === 'global');
    }

    // -------------------- Shared helpers --------------------
    function showOverlay(text) {
        if (!overlay) return;
        overlay.classList.remove('hidden');
        if (overlayText) overlayText.textContent = text;
    }
    function hideOverlay() { if (overlay) overlay.classList.add('hidden'); }
    function setHint(html) { if (gameHint) gameHint.innerHTML = html; }
    function setScore(v) { if (scoreEl) scoreEl.textContent = v.toLocaleString(); }
    function showCanvas() {
        canvas.style.display = 'block';
        if (gameDom) gameDom.hidden = true;
    }
    function showDom() {
        canvas.style.display = 'none';
        if (gameDom) gameDom.hidden = false;
    }

    // -------------------- SNAKE --------------------
    const Snake = (function () {
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        let snake, food, dx, dy, score, speed, foodParticles;
        let loop = null, running = false;
        let keyHandler = null;

        class Spark {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.vx = (Math.random() - 0.5) * 6;
                this.vy = (Math.random() - 0.5) * 6;
                this.life = 1;
                this.size = Math.random() * 3 + 1;
            }
            update() { this.x += this.vx; this.y += this.vy; this.life -= 0.04; this.vx *= 0.97; this.vy *= 0.97; }
            draw() {
                if (this.life <= 0) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
                ctx.fillStyle = color(58, this.life);
                ctx.fill();
            }
        }

        function reset() {
            const mid = Math.floor(tileCount / 2);
            snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
            dx = 1; dy = 0; score = 0; speed = 120; foodParticles = [];
            setScore(0);
            placeFood();
        }
        function placeFood() {
            let ok = false;
            while (!ok) {
                food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
                ok = !snake.some(s => s.x === food.x && s.y === food.y);
            }
        }
        function draw() {
            ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = color(58, 0.03);
            ctx.lineWidth = 0.5;
            for (let i = 0; i < tileCount; i++) {
                ctx.beginPath(); ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, canvas.height); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i * gridSize); ctx.lineTo(canvas.width, i * gridSize); ctx.stroke();
            }

            foodParticles = foodParticles.filter(p => p.life > 0);
            foodParticles.forEach(p => { p.update(); p.draw(); });

            const cx = food.x * gridSize + gridSize / 2;
            const cy = food.y * gridSize + gridSize / 2;
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gridSize);
            g.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(food.x * gridSize - gridSize / 2, food.y * gridSize - gridSize / 2, gridSize * 2, gridSize * 2);

            ctx.beginPath();
            ctx.arc(cx, cy, gridSize / 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();

            snake.forEach((seg, i) => {
                const l = 58 - (i / snake.length) * 30;
                ctx.fillStyle = `hsl(${hue()}, 75%, ${Math.max(20, l)}%)`;
                const pad = i === 0 ? 1 : 2;
                const r = i === 0 ? 5 : 3;
                const sx = seg.x * gridSize + pad;
                const sy = seg.y * gridSize + pad;
                const sw = gridSize - pad * 2;
                const sh = gridSize - pad * 2;
                ctx.beginPath();
                ctx.moveTo(sx + r, sy);
                ctx.arcTo(sx + sw, sy, sx + sw, sy + sh, r);
                ctx.arcTo(sx + sw, sy + sh, sx, sy + sh, r);
                ctx.arcTo(sx, sy + sh, sx, sy, r);
                ctx.arcTo(sx, sy, sx + sw, sy, r);
                ctx.closePath();
                ctx.fill();
                if (i === 0) {
                    ctx.shadowColor = color(58, 0.5);
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });
        }
        function tick() {
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return end();
            if (snake.some(s => s.x === head.x && s.y === head.y)) return end();
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                setScore(score);
                for (let i = 0; i < 12; i++) {
                    foodParticles.push(new Spark(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2));
                }
                placeFood();
                if (speed > 60) speed -= 2;
            } else snake.pop();
            draw();
        }
        function end() {
            running = false;
            clearInterval(loop); loop = null;
            showOverlay(`Game Over — ${score}`);
            if (gameButton) gameButton.textContent = 'Play Again';
            handleScore('snake', score);
        }
        function start() {
            if (running) return;
            reset();
            running = true;
            hideOverlay();
            if (gameButton) gameButton.textContent = 'Restart';
            draw();
            loop = setInterval(tick, speed);
        }
        function stop() {
            running = false;
            if (loop) { clearInterval(loop); loop = null; }
            if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
        }
        function enter() {
            showCanvas();
            setHint('Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to move.');
            renderBoard('snake');
            reset();
            draw();
            showOverlay('Press Start to Play');
            if (gameButton) gameButton.textContent = 'Start Game';
            keyHandler = (e) => {
                if (!running) return;
                switch (e.key) {
                    case 'ArrowUp': case 'w': case 'W': if (dy !== 1) { dx = 0; dy = -1; } e.preventDefault(); break;
                    case 'ArrowDown': case 's': case 'S': if (dy !== -1) { dx = 0; dy = 1; } e.preventDefault(); break;
                    case 'ArrowLeft': case 'a': case 'A': if (dx !== 1) { dx = -1; dy = 0; } e.preventDefault(); break;
                    case 'ArrowRight': case 'd': case 'D': if (dx !== -1) { dx = 1; dy = 0; } e.preventDefault(); break;
                }
            };
            document.addEventListener('keydown', keyHandler);
        }
        return { enter, stop, start, restart: () => { stop(); enter(); start(); } };
    })();

    // -------------------- BREAKOUT --------------------
    const Breakout = (function () {
        const paddleW = 80, paddleH = 10;
        const ballR = 6;
        const brickRows = 5, brickCols = 10, brickH = 18, brickPad = 4;
        let paddleX, ballX, ballY, ballVX, ballVY, bricks, score, lives;
        let raf = null, running = false, keyHandler = null;
        const keys = { left: false, right: false };

        function reset() {
            paddleX = (canvas.width - paddleW) / 2;
            ballX = canvas.width / 2;
            ballY = canvas.height - 40;
            ballVX = 3 * (Math.random() < 0.5 ? -1 : 1);
            ballVY = -3.2;
            score = 0; lives = 3;
            const brickW = (canvas.width - brickPad * (brickCols + 1)) / brickCols;
            bricks = [];
            for (let r = 0; r < brickRows; r++) {
                for (let c = 0; c < brickCols; c++) {
                    bricks.push({
                        x: brickPad + c * (brickW + brickPad),
                        y: 40 + r * (brickH + brickPad),
                        w: brickW, h: brickH, alive: true, row: r
                    });
                }
            }
            setScore(0);
        }

        function draw() {
            ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            bricks.forEach(b => {
                if (!b.alive) return;
                const l = 65 - b.row * 5;
                ctx.fillStyle = `hsl(${hue()}, 75%, ${l}%)`;
                ctx.shadowColor = color(58, 0.4);
                ctx.shadowBlur = 8;
                ctx.fillRect(b.x, b.y, b.w, b.h);
                ctx.shadowBlur = 0;
            });

            const pg = ctx.createLinearGradient(paddleX, 0, paddleX + paddleW, 0);
            pg.addColorStop(0, color(40));
            pg.addColorStop(0.5, color(65));
            pg.addColorStop(1, color(40));
            ctx.fillStyle = pg;
            ctx.shadowColor = color(58, 0.5);
            ctx.shadowBlur = 10;
            ctx.fillRect(paddleX, canvas.height - 24, paddleW, paddleH);
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
            ctx.fillStyle = color(75);
            ctx.shadowColor = color(58, 0.6);
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = color(75);
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.fillText('♥'.repeat(lives), 8, 18);
        }

        function step() {
            if (keys.left) paddleX -= 6;
            if (keys.right) paddleX += 6;
            paddleX = Math.max(0, Math.min(canvas.width - paddleW, paddleX));

            ballX += ballVX; ballY += ballVY;

            if (ballX - ballR < 0 || ballX + ballR > canvas.width) ballVX = -ballVX;
            if (ballY - ballR < 0) ballVY = -ballVY;

            if (ballY + ballR > canvas.height - 24 && ballY + ballR < canvas.height - 14 &&
                ballX > paddleX && ballX < paddleX + paddleW && ballVY > 0) {
                ballVY = -Math.abs(ballVY);
                const hit = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
                ballVX = hit * 4.5;
            }

            for (const b of bricks) {
                if (!b.alive) continue;
                if (ballX > b.x && ballX < b.x + b.w && ballY > b.y && ballY < b.y + b.h) {
                    b.alive = false;
                    ballVY = -ballVY;
                    score += (brickRows - b.row) * 10;
                    setScore(score);
                    break;
                }
            }

            if (ballY - ballR > canvas.height) {
                lives--;
                if (lives <= 0) return end();
                ballX = canvas.width / 2; ballY = canvas.height - 40;
                ballVX = 3 * (Math.random() < 0.5 ? -1 : 1); ballVY = -3.2;
            }

            if (bricks.every(b => !b.alive)) {
                score += 200; setScore(score);
                reset();
            }

            draw();
            if (running) raf = requestAnimationFrame(step);
        }

        function end() {
            running = false;
            if (raf) { cancelAnimationFrame(raf); raf = null; }
            showOverlay(`Game Over — ${score}`);
            if (gameButton) gameButton.textContent = 'Play Again';
            handleScore('breakout', score);
        }

        function start() {
            if (running) return;
            reset();
            running = true;
            hideOverlay();
            if (gameButton) gameButton.textContent = 'Restart';
            raf = requestAnimationFrame(step);
        }

        function stop() {
            running = false;
            if (raf) { cancelAnimationFrame(raf); raf = null; }
            if (keyHandler) { document.removeEventListener('keydown', keyHandler); document.removeEventListener('keyup', keyHandler); keyHandler = null; }
            keys.left = keys.right = false;
        }

        function enter() {
            showCanvas();
            setHint('Use <kbd>A</kbd><kbd>D</kbd> or <kbd>&larr;</kbd><kbd>&rarr;</kbd> to move the paddle.');
            renderBoard('breakout');
            reset();
            draw();
            showOverlay('Press Start to Play');
            if (gameButton) gameButton.textContent = 'Start Game';

            keyHandler = (e) => {
                const down = e.type === 'keydown';
                switch (e.key) {
                    case 'ArrowLeft': case 'a': case 'A': keys.left = down; e.preventDefault(); break;
                    case 'ArrowRight': case 'd': case 'D': keys.right = down; e.preventDefault(); break;
                }
            };
            document.addEventListener('keydown', keyHandler);
            document.addEventListener('keyup', keyHandler);
        }

        return { enter, stop, start, restart: () => { stop(); enter(); start(); } };
    })();

    // -------------------- 2048 --------------------
    const Game2048 = (function () {
        const SIZE = 4;
        let grid, score, running = false, keyHandler = null, over = false;

        function emptyGrid() {
            return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
        }
        function addTile() {
            const empty = [];
            for (let r = 0; r < SIZE; r++)
                for (let c = 0; c < SIZE; c++)
                    if (grid[r][c] === 0) empty.push([r, c]);
            if (!empty.length) return;
            const [r, c] = empty[Math.floor(Math.random() * empty.length)];
            grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
        function reset() {
            grid = emptyGrid();
            score = 0; over = false;
            addTile(); addTile();
            setScore(0);
            render();
        }
        function slide(row) {
            const filtered = row.filter(v => v !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    score += filtered[i];
                    filtered.splice(i + 1, 1);
                }
            }
            while (filtered.length < SIZE) filtered.push(0);
            return filtered;
        }
        function rotate(g) {
            const n = emptyGrid();
            for (let r = 0; r < SIZE; r++)
                for (let c = 0; c < SIZE; c++)
                    n[c][SIZE - 1 - r] = g[r][c];
            return n;
        }
        function move(dir) {
            const before = JSON.stringify(grid);
            const rotations = { left: 0, up: 1, right: 2, down: 3 }[dir];
            for (let i = 0; i < rotations; i++) grid = rotate(grid);
            grid = grid.map(slide);
            for (let i = 0; i < (4 - rotations) % 4; i++) grid = rotate(grid);
            const after = JSON.stringify(grid);
            if (before !== after) {
                addTile();
                setScore(score);
                render();
                if (isStuck()) {
                    over = true;
                    running = false;
                    showOverlay(`Game Over — ${score}`);
                    if (gameButton) gameButton.textContent = 'Play Again';
                    handleScore('2048', score);
                }
            }
        }
        function isStuck() {
            for (let r = 0; r < SIZE; r++)
                for (let c = 0; c < SIZE; c++) {
                    if (grid[r][c] === 0) return false;
                    if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return false;
                    if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return false;
                }
            return true;
        }
        function tileStyle(v) {
            if (!v) return '';
            const step = Math.min(11, Math.log2(v));
            const l = 75 - step * 4;
            return `background: hsl(${hue()}, 75%, ${l}%); color: ${l > 50 ? '#0a0a0f' : '#fff'};`;
        }
        function render() {
            if (!gameDom) return;
            gameDom.innerHTML = `
                <div class="g2048-board">
                    ${grid.map(row => row.map(v => `
                        <div class="g2048-tile${v ? ' has-val' : ''}" style="${tileStyle(v)}">${v || ''}</div>
                    `).join('')).join('')}
                </div>
            `;
        }
        function start() {
            if (running && !over) return;
            reset();
            running = true;
            hideOverlay();
            if (gameButton) gameButton.textContent = 'Restart';
        }
        function stop() {
            running = false;
            if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
        }
        function enter() {
            showDom();
            setHint('<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to slide. Merge matching tiles.');
            renderBoard('2048');
            reset();
            showOverlay('Press Start to Play');
            if (gameButton) gameButton.textContent = 'Start Game';

            keyHandler = (e) => {
                if (!running || over) return;
                switch (e.key) {
                    case 'ArrowUp': case 'w': case 'W': move('up'); e.preventDefault(); break;
                    case 'ArrowDown': case 's': case 'S': move('down'); e.preventDefault(); break;
                    case 'ArrowLeft': case 'a': case 'A': move('left'); e.preventDefault(); break;
                    case 'ArrowRight': case 'd': case 'D': move('right'); e.preventDefault(); break;
                }
            };
            document.addEventListener('keydown', keyHandler);
        }

        return { enter, stop, start, restart: () => { stop(); enter(); start(); } };
    })();

    // -------------------- Game Switcher --------------------
    const GAMES = { snake: Snake, breakout: Breakout, '2048': Game2048 };
    let current = 'snake';

    function switchGame(id) {
        if (!GAMES[id]) return;
        GAMES[current].stop();
        current = id;
        tabs.forEach(t => {
            const active = t.dataset.game === id;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active);
        });
        GAMES[id].enter();
    }

    tabs.forEach(t => {
        t.addEventListener('click', () => switchGame(t.dataset.game));
    });

    if (gameButton) {
        gameButton.addEventListener('click', () => {
            GAMES[current].restart();
        });
    }

    bindModeToggle();

    // Initial boot
    Snake.enter();
})();
