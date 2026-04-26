/* ===========================
   game.js — 갤러그식 패스워드 입력
   =========================== */

/* ──────────────────────────────
   ★ 여기를 수정하세요 ★
   ────────────────────────────── */
const GAME_CONFIG = {
  /* 이 페이지의 패스워드 (영문 대문자) */
  password: "ALPHA",

  /* 힌트 */
  hintText: [
    "힌트 1: 영문 대문자 다섯 글자.",
    "힌트 2: 그리스 알파벳의 첫 번째.",
    "힌트 3: A로 시작해 A로 끝난다."
  ].join("\n"),

  /* 패스워드 성공 후 표시될 내용 */
  secretText: [
    "▓▒░ SECTOR-2 기밀 해제 ░▒▓",
    "",
    "이곳에 숨겨진 내용을 자유롭게 작성하세요.",
    "날짜 : [REDACTED]",
    "",
    "C:\\SECTOR2\\SECRET> _"
  ].join("\n")
};

/* ──────────────────────────────
   상수 & 전역 상태
   ────────────────────────────── */
const ALPHABET   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COL_COUNT  = 8;

let canvas, ctx, CANVAS_W, CANVAS_H, COL_W;
let gameRunning  = false;
let letters      = [];
let bullets      = [];
let ship         = {};
let collected    = "";
let keys         = {};
let frameId      = null;
let lastDropTime = 0;
let dropInterval = 880;
let shootCooldown = 0;
let msgTimer     = 0;

/* ──────────────────────────────
   DOM
   ────────────────────────────── */
const startBtn      = document.getElementById("startBtn");
const cancelBtn     = document.getElementById("cancelBtn");
const okBtn         = document.getElementById("okBtn");
const hintToggle    = document.getElementById("hintToggle");
const hintBody      = document.getElementById("hintBody");
const hintTextEl    = document.getElementById("hintText");
const hintCursor    = document.getElementById("hintCursor");
const gameModal     = document.getElementById("gameModal");
const modalSuccess  = document.getElementById("modalSuccess");
const targetSlots   = document.getElementById("targetSlots");
const inputLetters  = document.getElementById("inputLetters");
const gameMsg       = document.getElementById("gameMsg");
const secretText    = document.getElementById("secretText");

let hintOpen  = false;
let hintTyped = false;

/* ──────────────────────────────
   이벤트 등록
   ────────────────────────────── */
startBtn.addEventListener("click", openGame);
cancelBtn.addEventListener("click", closeGame);
okBtn.addEventListener("click", () => { modalSuccess.classList.remove("show"); });
hintToggle.addEventListener("click", toggleHint);

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") e.preventDefault();
  if (e.key === "Escape") closeGame();
});
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

/* ──────────────────────────────
   캔버스 크기 초기화
   ────────────────────────────── */
function initCanvas() {
  canvas  = document.getElementById("gameCanvas");
  CANVAS_W = Math.min(360, window.innerWidth - 48);
  CANVAS_H = Math.round(CANVAS_W * (340 / 360));
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  COL_W = CANVAS_W / COL_COUNT;
  ctx = canvas.getContext("2d");
  ship = { x: CANVAS_W / 2, y: CANVAS_H - 26, w: 18, h: 14 };
}

/* ──────────────────────────────
   게임 열기 / 닫기
   ────────────────────────────── */
function openGame() {
  initCanvas();
  resetGame();
  renderTargetSlots();
  gameModal.classList.add("show");
  gameRunning = true;
  lastDropTime = performance.now();
  frameId = requestAnimationFrame(loop);
}

function closeGame() {
  gameRunning = false;
  cancelAnimationFrame(frameId);
  gameModal.classList.remove("show");
}

function resetGame() {
  collected    = "";
  letters      = [];
  bullets      = [];
  dropInterval = 880;
  shootCooldown = 0;
  msgTimer     = 0;
  ship.x       = CANVAS_W / 2;
  gameMsg.textContent = "";
  updateInputDisplay();
}

/* ──────────────────────────────
   TARGET 슬롯 렌더링
   ────────────────────────────── */
function renderTargetSlots() {
  targetSlots.innerHTML = GAME_CONFIG.password.split("").map(() =>
    `<span class="target-slot">_</span>`
  ).join("");
}

function updateTargetSlots() {
  const slots = targetSlots.querySelectorAll(".target-slot");
  slots.forEach((slot, i) => {
    if (i < collected.length) {
      slot.textContent = GAME_CONFIG.password[i];
      slot.classList.add("filled");
    } else {
      slot.textContent = "_";
      slot.classList.remove("filled");
    }
  });
}

function updateInputDisplay() {
  inputLetters.textContent = collected.split("").join(" ");
  updateTargetSlots();
}

/* ──────────────────────────────
   알파벳 스폰
   ────────────────────────────── */
function spawnLetter() {
  const col     = Math.floor(Math.random() * COL_COUNT);
  const needed  = GAME_CONFIG.password[collected.length];
  /* 45% 확률로 필요한 문자, 나머지는 랜덤 */
  const isNeeded = needed && Math.random() < 0.45;
  const ch = isNeeded
    ? needed
    : ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

  letters.push({
    x     : col * COL_W + COL_W / 2,
    y     : -12,
    ch,
    speed : 0.65 + Math.random() * 0.55,
    hit   : false
  });
}

/* ──────────────────────────────
   발사
   ────────────────────────────── */
function fireBullet() {
  bullets.push({ x: ship.x, y: ship.y - 12 });
}

/* ──────────────────────────────
   메인 루프
   ────────────────────────────── */
function loop(ts) {
  if (!gameRunning) return;

  /* 알파벳 드롭 */
  if (ts - lastDropTime > dropInterval) {
    spawnLetter();
    lastDropTime = ts;
    dropInterval = Math.max(480, dropInterval - 3);
  }

  /* 쿨다운 */
  if (shootCooldown > 0) shootCooldown--;
  if (msgTimer > 0) { msgTimer--; }
  else if (gameMsg.textContent) gameMsg.textContent = "";

  /* 이동 */
  const speed = 3.8;
  if (keys["ArrowLeft"]  || keys["a"]) ship.x = Math.max(ship.w / 2, ship.x - speed);
  if (keys["ArrowRight"] || keys["d"]) ship.x = Math.min(CANVAS_W - ship.w / 2, ship.x + speed);

  /* 발사 */
  if ((keys[" "] || keys["ArrowUp"]) && shootCooldown === 0) {
    fireBullet();
    shootCooldown = 16;
  }

  /* 총알 이동 */
  bullets.forEach(b => (b.y -= 8));
  bullets = bullets.filter(b => b.y > -20);

  /* 알파벳 낙하 */
  letters.forEach(l => { if (!l.hit) l.y += l.speed; });
  letters = letters.filter(l => l.y < CANVAS_H + 20 && !l.hit);

  /* 충돌 판정 */
  bullets.forEach(b => {
    letters.forEach(l => {
      if (l.hit) return;
      if (Math.abs(b.x - l.x) < 15 && Math.abs(b.y - l.y) < 16) {
        b.y = -999;
        l.hit = true;
        onLetterHit(l.ch);
      }
    });
  });

  draw();
  frameId = requestAnimationFrame(loop);
}

/* ──────────────────────────────
   문자 명중 처리
   ────────────────────────────── */
function onLetterHit(ch) {
  const needed = GAME_CONFIG.password[collected.length];
  if (ch === needed) {
    collected += ch;
    updateInputDisplay();
    if (collected === GAME_CONFIG.password) {
      /* 성공 */
      setTimeout(() => {
        closeGame();
        showSuccess();
      }, 350);
    }
  } else {
    /* 오답 — 마지막 글자 지우기 */
    gameMsg.textContent = `✗ 오류 — '${ch}' 는 잘못된 문자`;
    msgTimer = 90;
    if (collected.length > 0) {
      collected = collected.slice(0, -1);
      updateInputDisplay();
    }
  }
}

/* ──────────────────────────────
   성공 처리
   ────────────────────────────── */
function showSuccess() {
  modalSuccess.classList.add("show");
  secretText.textContent = "";
  typeText(secretText, GAME_CONFIG.secretText);
}

/* ──────────────────────────────
   그리기
   ────────────────────────────── */
function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  /* 컬럼 가이드선 */
  ctx.strokeStyle = "#001800";
  ctx.lineWidth   = 0.5;
  for (let i = 1; i < COL_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * COL_W, 0);
    ctx.lineTo(i * COL_W, CANVAS_H);
    ctx.stroke();
  }

  /* 알파벳 */
  const needed = GAME_CONFIG.password[collected.length];
  letters.forEach(l => {
    if (l.hit) return;
    const isNeeded = l.ch === needed;
    ctx.font      = `${Math.round(CANVAS_W * 0.065)}px 'VT323', monospace`;
    ctx.fillStyle = isNeeded ? "#ffff00" : "#006600";
    ctx.textAlign = "center";
    ctx.fillText(l.ch, l.x, l.y);
    /* 필요 문자 하이라이트 박스 */
    if (isNeeded) {
      ctx.strokeStyle = "rgba(255,255,0,0.25)";
      ctx.lineWidth   = 1;
      ctx.strokeRect(l.x - 13, l.y - 18, 26, 24);
    }
  });

  /* 총알 */
  bullets.forEach(b => {
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(b.x - 1.5, b.y - 8, 3, 10);
  });

  /* 바닥 경계선 */
  ctx.strokeStyle = "#002200";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_H - 30);
  ctx.lineTo(CANVAS_W, CANVAS_H - 30);
  ctx.stroke();

  /* 전투기 */
  drawShip(ship.x, ship.y);
}

function drawShip(x, y) {
  ctx.fillStyle = "#00ff00";
  ctx.beginPath();
  ctx.moveTo(x,      y - 14);
  ctx.lineTo(x - 10, y + 4);
  ctx.lineTo(x - 5,  y + 2);
  ctx.lineTo(x - 5,  y + 7);
  ctx.lineTo(x + 5,  y + 7);
  ctx.lineTo(x + 5,  y + 2);
  ctx.lineTo(x + 10, y + 4);
  ctx.closePath();
  ctx.fill();
  /* 조종석 */
  ctx.fillStyle = "#003300";
  ctx.fillRect(x - 2, y + 2, 4, 4);
}

/* ──────────────────────────────
   모바일 터치 조작
   ────────────────────────────── */
let touchStartX = null;

document.getElementById("gameCanvas").addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  if (shootCooldown === 0) { fireBullet(); shootCooldown = 16; }
}, { passive: true });

document.getElementById("gameCanvas").addEventListener("touchmove", (e) => {
  if (touchStartX === null) return;
  const dx = e.touches[0].clientX - touchStartX;
  ship.x = Math.max(ship.w / 2, Math.min(CANVAS_W - ship.w / 2, ship.x + dx * 0.6));
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.getElementById("gameCanvas").addEventListener("touchend", () => {
  touchStartX = null;
}, { passive: true });

/* ──────────────────────────────
   힌트 토글
   ────────────────────────────── */
function toggleHint() {
  hintOpen = !hintOpen;
  hintBody.classList.toggle("open", hintOpen);
  hintToggle.textContent = (hintOpen ? "▼" : "▶") + " [HINT] 힌트 보기";
  if (hintOpen && !hintTyped) {
    hintTyped = true;
    hintCursor.style.display = "inline-block";
    typeText(hintTextEl, GAME_CONFIG.hintText, () => {
      hintCursor.style.display = "none";
    });
  }
}

/* ──────────────────────────────
   타이핑 효과
   ────────────────────────────── */
function typeText(element, text, onComplete = null, delay = 32) {
  let i = 0;
  element.textContent = "";
  const iv = setInterval(() => {
    if (i < text.length) { element.textContent += text[i]; i++; }
    else { clearInterval(iv); if (onComplete) onComplete(); }
  }, delay);
}
