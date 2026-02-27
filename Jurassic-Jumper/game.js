const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 480, H = 640;
canvas.width = W;
canvas.height = H;

// Sprites
const sprite = new Image();
sprite.src = 'Images/Dinosaur.png';
const asteroidSprite = new Image();
asteroidSprite.src = 'Images/Asteroid.png';

// Physics
const GRAVITY = 0.45;
const JUMP_VEL = -14;
const SPRING_VEL = JUMP_VEL * Math.SQRT2; // ~2x height
const SPEED = 5.5;

// States
const S = { START: 0, PLAY: 1, OVER: 2 };
let state = S.START;
let player, platforms, cameraY, startY, score, best = 0;

// Asteroids
let asteroids = [];
let asteroidTimer = 0;
const ASTEROID_SIZE = 64;
const ASTEROID_FALL_SPEED = 2.5;
const ASTEROID_WARN_TICKS = 300; // 5 seconds at 60fps
const ASTEROID_SPAWN_MIN = 360;  // 6s minimum between spawns
const ASTEROID_SPAWN_MAX = 720;  // 12s maximum between spawns

// Input
const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if ((e.code === 'Space' || e.code === 'Enter') && state !== S.PLAY) startGame();
});
addEventListener('keyup', e => delete keys[e.code]);
canvas.addEventListener('click', () => { if (state !== S.PLAY) startGame(); });

// ─── Audio ───────────────────────────────────────────────
let ac;
function getAC() { return ac || (ac = new AudioContext()); }

function beep(f1, f2, dur, type = 'sine') {
  try {
    const c = getAC(), o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, c.currentTime);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + dur);
    g.gain.setValueAtTime(0.22, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur);
  } catch (_) {}
}

function crack() {
  try {
    const c = getAC(), n = Math.ceil(c.sampleRate * 0.18);
    const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.setValueAtTime(0.3, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
    src.connect(g); g.connect(c.destination); src.start();
  } catch (_) {}
}

// ─── Platforms ───────────────────────────────────────────
const PT = { STATIC: 0, MOVING: 1, BREAKABLE: 2, SPRING: 3 };

function getDiff() { return Math.min(1, score / 6000); }

function makePlatform(y, diff) {
  const w = 80 + Math.random() * 60;
  const x = Math.random() * (W - w);
  const r = Math.random();
  let type;
  if      (diff < 0.3) type = r < 0.88 ? PT.STATIC : r < 0.94 ? PT.SPRING : PT.MOVING;
  else if (diff < 0.6) type = r < 0.65 ? PT.STATIC : r < 0.78 ? PT.MOVING : r < 0.90 ? PT.BREAKABLE : PT.SPRING;
  else                 type = r < 0.45 ? PT.STATIC : r < 0.65 ? PT.MOVING : r < 0.82 ? PT.BREAKABLE : PT.SPRING;
  return {
    type, x, y, w, h: 16,
    startX: x, dir: 1,
    speed: type === PT.MOVING ? (1.5 + diff * 3) * (Math.random() < 0.5 ? 1 : -1) : 0,
    range: 50 + Math.random() * (60 + diff * 80),
    broken: false, breakTimer: 0, pop: 0,
  };
}

function genPlatforms(fromY, toY, diff) {
  let y = fromY;
  while (y > toY) {
    y -= 70 + Math.random() * (20 + diff * 100);
    platforms.push(makePlatform(y, diff));
  }
}

// ─── Init ─────────────────────────────────────────────────
function initGame() {
  score = 0; cameraY = 0; platforms = [];
  asteroids = [];
  asteroidTimer = ASTEROID_SPAWN_MIN + Math.random() * (ASTEROID_SPAWN_MAX - ASTEROID_SPAWN_MIN);
  player = { x: W / 2 - 32, y: H - 130, w: 64, h: 64, vx: 0, vy: JUMP_VEL, prevY: H - 120 };
  startY = player.y;
  // Guaranteed starting platform directly below player
  platforms.push({ type: PT.STATIC, x: player.x - 15, y: player.y + player.h + 5, w: 130, h: 16,
    startX: 0, dir: 1, speed: 0, range: 0, broken: false, breakTimer: 0, pop: 0 });
  genPlatforms(player.y + player.h, cameraY - H * 3, 0);
}

function startGame() { initGame(); state = S.PLAY; }

// ─── Update ───────────────────────────────────────────────
function update() {
  if (state !== S.PLAY) return;

  // Input
  if      (keys['ArrowLeft']  || keys['KeyA']) player.vx = -SPEED;
  else if (keys['ArrowRight'] || keys['KeyD']) player.vx =  SPEED;
  else player.vx *= 0.75;

  // Physics
  player.vy += GRAVITY;
  player.prevY = player.y;
  player.x += player.vx;
  player.y += player.vy;

  // Horizontal wrap
  if (player.x + player.w < 0) player.x = W;
  if (player.x > W)             player.x = -player.w;

  // Camera: only scrolls up
  const target = player.y - H * 0.38;
  if (target < cameraY) cameraY = target;

  // Score = max height climbed
  score = Math.max(score, Math.floor(startY - player.y));
  best  = Math.max(best, score);

  // Platform tick
  for (const p of platforms) {
    if (p.type === PT.MOVING) {
      p.x += p.speed * p.dir;
      if (Math.abs(p.x - p.startX) > p.range) p.dir *= -1;
    }
    if (p.broken && p.breakTimer > 0) p.breakTimer--;
    if (p.pop > 0) p.pop--;
  }

  // Collision — only when falling
  if (player.vy > 0) {
    for (const p of platforms) {
      if (p.broken) continue;
      const prevBot = player.prevY + player.h;
      const currBot = player.y + player.h;
      if (prevBot <= p.y + p.h * 0.5 && currBot >= p.y &&
          player.x + player.w > p.x + 4 && player.x < p.x + p.w - 4) {
        player.y = p.y - player.h;
        if (p.type === PT.SPRING) { player.vy = SPRING_VEL; p.pop = 10; beep(300, 1400, 0.25); }
        else                      { player.vy = JUMP_VEL;               beep(400, 900,  0.2);  }
        if (p.type === PT.BREAKABLE) { p.broken = true; p.breakTimer = 20; crack(); }
        break;
      }
    }
  }

  // Clean up off-screen / expired platforms
  platforms = platforms.filter(p => !(p.broken && p.breakTimer <= 0) && p.y < cameraY + H);

  // Generate more platforms above view
  let topY = cameraY;
  for (const p of platforms) if (p.y < topY) topY = p.y;
  if (topY > cameraY - H * 2) genPlatforms(topY, cameraY - H * 3, getDiff());

  // Asteroid spawning
  asteroidTimer--;
  if (asteroidTimer <= 0) {
    const ax = Math.random() * (W - ASTEROID_SIZE);
    asteroids.push({
      x: ax, y: cameraY - ASTEROID_SIZE, // starts above camera
      warn: ASTEROID_WARN_TICKS,          // warning countdown
      falling: false,
    });
    asteroidTimer = ASTEROID_SPAWN_MIN + Math.random() * (ASTEROID_SPAWN_MAX - ASTEROID_SPAWN_MIN);
  }

  // Asteroid update
  for (const a of asteroids) {
    if (a.warn > 0) {
      a.warn--;
      a.y = cameraY - ASTEROID_SIZE; // keep pinned above camera during warning
      if (a.warn <= 0) a.falling = true;
    }
    if (a.falling) {
      a.y += ASTEROID_FALL_SPEED;
    }
  }

  // Asteroid collision
  for (const a of asteroids) {
    if (!a.falling) continue;
    const asx = a.x, asy = a.y - cameraY;
    const px = player.x, py = player.y - cameraY;
    const margin = 10; // forgiving hitbox
    if (px + player.w - margin > asx + margin && px + margin < asx + ASTEROID_SIZE - margin &&
        py + player.h - margin > asy + margin && py + margin < asy + ASTEROID_SIZE - margin) {
      beep(150, 60, 0.5, 'sawtooth');
      setTimeout(() => beep(80, 40, 0.4, 'sawtooth'), 200);
      state = S.OVER;
    }
  }

  // Clean up off-screen asteroids
  asteroids = asteroids.filter(a => a.y - cameraY < H + 100);

  // Game over
  if (player.y - cameraY > H + 50) {
    [400, 350, 280, 200].forEach((f, i) =>
      setTimeout(() => beep(f, null, 0.22, 'sawtooth'), i * 260));
    state = S.OVER;
  }
}

// ─── Draw helpers ─────────────────────────────────────────
function rRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);   ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);   ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);       ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
  if (fill)   { ctx.fillStyle = fill;   ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
}

function txt(s, x, y, size, fill, stroke) {
  ctx.font = `bold ${size}px 'Fredoka One', sans-serif`;
  ctx.textAlign = 'center';
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 4; ctx.strokeText(s, x, y); }
  ctx.fillStyle = fill; ctx.fillText(s, x, y);
}

// ─── Draw platform ────────────────────────────────────────
function drawPlatform(p) {
  const sx = p.x, sy = p.y - cameraY;
  if (p.broken || sy > H + 20 || sy < -30) return;

  switch (p.type) {
    case PT.STATIC:
      rRect(sx, sy, p.w, p.h, 6, '#4CAF50', '#2E7D32');
      break;

    case PT.MOVING:
      rRect(sx, sy, p.w, p.h, 6, '#7C4DFF', '#4527A0');
      ctx.fillStyle = '#EDE7F6'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('◄ ►', sx + p.w / 2, sy + 11);
      break;

    case PT.BREAKABLE:
      rRect(sx, sy, p.w, p.h, 4, '#8D6E63', '#4E342E');
      ctx.strokeStyle = '#3E2723'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx + p.w * 0.35, sy + 1); ctx.lineTo(sx + p.w * 0.25, sy + p.h - 1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + p.w * 0.65, sy + 1); ctx.lineTo(sx + p.w * 0.75, sy + p.h - 1); ctx.stroke();
      break;

    case PT.SPRING: {
      const yo = p.pop > 0 ? 3 : 0;
      rRect(sx, sy + yo, p.w, p.h, 6, '#FFD600', '#F57F17');
      const mx = sx + p.w / 2, ct = sy + yo - (p.pop > 0 ? 5 : 11);
      ctx.strokeStyle = '#E65100'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(mx, ct);
      for (let i = 0; i < 4; i++)
        ctx.lineTo(mx + (i % 2 === 0 ? 8 : -8), ct + (i + 1) * ((sy + yo - ct) / 4));
      ctx.lineTo(mx, sy + yo);
      ctx.stroke();
      break;
    }
  }
}

// ─── Draw ─────────────────────────────────────────────────
function draw() {
  // Sky
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#E0F7FA');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  if (state === S.START) {
    txt('Jurassic Jumper!', W / 2, H / 2 - 55, 44, '#FFD600', '#1565C0');
    txt('Arrow keys / A-D to move', W / 2, H / 2 + 10, 18, '#333');
    txt("Don't fall!", W / 2, H / 2 + 38, 18, '#333');
    if (Date.now() % 1200 < 700)
      txt('Press SPACE or click to start', W / 2, H / 2 + 90, 19, '#FF5722', '#fff');
    if (best > 0) txt(`Best: ${best}`, W / 2, H / 2 + 130, 18, '#4CAF50', '#fff');
    return;
  }

  for (const p of platforms) drawPlatform(p);

  // Asteroids & warnings
  for (const a of asteroids) {
    if (a.warn > 0) {
      // Red exclamation mark warning at top of screen — drawn later on top of HUD
      a._drawWarn = true;
    }
    if (a.falling) {
      const asx = a.x, asy = a.y - cameraY;
      ctx.save();
      // Rotate 180° so flames point up and asteroid falls down
      ctx.translate(asx + ASTEROID_SIZE / 2, asy + ASTEROID_SIZE / 2);
      ctx.rotate(-35 * Math.PI / 180);
      ctx.drawImage(asteroidSprite, -ASTEROID_SIZE / 2, -ASTEROID_SIZE / 2, ASTEROID_SIZE, ASTEROID_SIZE);
      ctx.restore();
    }
  }

  // Player
  const px = player.x, py = player.y - cameraY;
  if (sprite.complete && sprite.naturalWidth > 0) {
    ctx.drawImage(sprite, px, py, player.w, player.h);
  } else {
    rRect(px, py, player.w, player.h, 8, '#FF5722', '#BF360C');
  }

  // Score HUD
  txt(`${score}`, W / 2, 42, 30, '#fff', '#333');

  // Asteroid warnings — drawn on top of score
  for (const a of asteroids) {
    if (a._drawWarn) {
      a._drawWarn = false;
      const wx = a.x + ASTEROID_SIZE / 2;
      const urgency = 1 - a.warn / ASTEROID_WARN_TICKS; // 0 → 1
      const flash = a.warn < 90 && Math.floor(a.warn / 4) % 2 === 0;
      if (!flash) {
        ctx.save();
        ctx.font = `bold ${48 + urgency * 16}px 'Fredoka One', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF1744';
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 18 + urgency * 24;
        ctx.globalAlpha = 0.7 + urgency * 0.3;
        ctx.fillText('!', wx, 52 + urgency * 6);
        // Double glow pass
        ctx.shadowBlur = 30 + urgency * 30;
        ctx.globalAlpha = 0.3 + urgency * 0.3;
        ctx.fillText('!', wx, 52 + urgency * 6);
        ctx.restore();
      }
    }
  }

  if (state === S.OVER) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    txt('GAME OVER', W / 2, H / 2 - 60, 52, '#FF5252', '#fff');
    txt(`Score: ${score}`, W / 2, H / 2, 28, '#fff', '#333');
    txt(`Best: ${best}`, W / 2, H / 2 + 38, 22, '#FFD600', '#333');
    if (Date.now() % 1200 < 700)
      txt('Press SPACE or click to play again', W / 2, H / 2 + 88, 18, '#fff', '#333');
  }
}

// ─── Loop (fixed timestep) ────────────────────────────────
const TICK = 1000 / 60;          // target 60 updates/sec
let lastTime = performance.now();
let accumulator = 0;

function loop(now) {
  accumulator += now - lastTime;
  lastTime = now;
  if (accumulator > TICK * 5) accumulator = TICK * 5; // cap to avoid spiral
  while (accumulator >= TICK) { update(); accumulator -= TICK; }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
