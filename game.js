/* ===========================
   game.js — 갤러그식 패스워드 입력 (v2)
   =========================== */

const GAME_CONFIG = {
  password   : "SOL_EUM",   // ★ 7글자 영문 대문자로 변경하세요
  hintText   : [
    "그건 어리석은 이의 이름이며,",
    "내가 가장 기다린 이의 이름이며.",
    "기꺼이 그리움이라 부를 이름.",
    "이 우주에, 불시착한 당신."
  ].join("\n"),
  secretText : "안녕, 이름 님."
};

/* ── 메신저 대화 내용 ──
   speaker: "A" | "B" | "SYSTEM"
   SYSTEM은 시스템 알림 메시지 스타일
   마지막 몇 줄은 눈치채는 내용 + 삭제 연출 */
const MESSAGES = [
  { speaker:"A", text:"C 씨는 사과맛을 고를거라 생각했어." },
  { speaker:"B", text:"어째서죠?" },
  { speaker:"A", text:"...낙원을 싫어하니까?" },
  { speaker:"B", text:"낙원을 싫어한 적은 없어요." },
  { speaker:"B", text:"편협한 이상향을 포장하는게 싫을뿐이죠." },
  { speaker:"A", text:"하하... 현실주의자 같은건가요?" },
  { speaker:"B", text:"현실주의자가 도시괴담으로 장난감을 만들고 있겠나요." },
  { speaker:"A", text:"뼈가 있는 말인데?" },
  { speaker:"A", text:"C 씨는 왜 이 연구소에 있는거야?" },
  { speaker:"B", text:"선배, 이제와서 지원동기를 물어요?" },
  { speaker:"B", text:"...첫 날" }, 
  { speaker:"B", text:"하늘을 봤는데, 별이 떠있었죠." },
  { speaker:"B", text:"그 순간에 그 별이 존재했는지, 이미 사라졌을지는 알 수가 없지만." },
  { speaker:"B", text:"제법 예뻤고, 이곳이 낙원이든 괴담이 득실거리는 지옥이든. 그 사실만큼은 변치 않잖아요." },
  { speaker:"B", text:"이 우주는, 분명 살아볼 가치가 있어요." },
  { speaker:"A", text:"스스로에 대한 이야기인가요?" },
  { speaker:"A", text:"아니면, 만나고 싶다는 사람?" },
  { speaker:"B", text:"아뇨." },
  { speaker:"B", text:"누구라도." },
  { speaker:"SYSTEM", text:"네트워크에 재접속합니다." },
  { speaker:"SYSTEM", text:"당신이 본 것은 과거거나, 미래거나" },
  { speaker:"SYSTEM", text:"혹은, 현재" },
  { speaker:"B", text:"당신이 그 이름을 안다는 건." },
  { speaker:"B", text:"저희 프로젝트가 잘 성공했다는거겠죠." },
  { speaker:"A", text:"누구에게 말하는 건가요?" },
  { speaker:"B", text:"음, 선배가 꿈꾸는 낙원의 주민들?" },
  { speaker:"A", text:"...??" },
  { speaker:"SYSTEM", text:"보안 코드를 입력하세요." },
  { speaker:"SYSTEM", text:"낙원은 무슨 맛입니까?" },
  { speaker:"B", text:"포도맛" },
  { speaker:"A", text:"잠시, C 씨!" },
  { speaker:"SYSTEM", text:"로그를 삭제하는 중..." },
];

/* ──────────────────────────────
   전역 상태
   ────────────────────────────── */
const ALPHABET  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const COL_COUNT = 8;
const PW_LEN    = GAME_CONFIG.password.length; // 7

let canvas, ctx, CW, CH, COL_W;
let gameRunning  = false;
let letters      = [];
let bullets      = [];
let ship         = {};
let collected    = "";   // 현재까지 맞춘 글자
let keys         = {};
let frameId      = null;
let lastDropTime = 0;
let dropInterval = 860;
let shootCooldown = 0;
let msgTimer     = 0;
let hintOpen = false, hintTyped = false;

/* ──────────────────────────────
   DOM
   ────────────────────────────── */
const startBtn     = document.getElementById("startBtn");
const cancelBtn    = document.getElementById("cancelBtn");
const hintToggle   = document.getElementById("hintToggle");
const hintBody     = document.getElementById("hintBody");
const hintTextEl   = document.getElementById("hintText");
const hintCursor   = document.getElementById("hintCursor");
const gameModal    = document.getElementById("gameModal");
const slotsEl      = document.getElementById("slots");
const gameMsgEl    = document.getElementById("gameMsg");
const messengerModal = document.getElementById("messengerModal");
const msgList      = document.getElementById("msgList");
const glitchOverlay = document.getElementById("glitchOverlay");

startBtn.addEventListener("click", openGame);
cancelBtn.addEventListener("click", closeGame);
hintToggle.addEventListener("click", toggleHint);
document.getElementById("retryBtn").addEventListener("click", () => location.reload());
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " ") e.preventDefault();
  if (e.key === "Escape") closeGame();
});
document.addEventListener("keyup", e => { keys[e.key] = false; });

/* ──────────────────────────────
   캔버스 초기화
   ────────────────────────────── */
function initCanvas() {
  canvas = document.getElementById("gameCanvas");
  CW = Math.min(360, window.innerWidth - 40);
  CH = Math.round(CW * 0.94);
  canvas.width = CW; canvas.height = CH;
  COL_W = CW / COL_COUNT;
  ctx = canvas.getContext("2d");
  ship = { x: CW / 2, y: CH - 26, w: 18 };
}

/* ──────────────────────────────
   슬롯 렌더링
   ────────────────────────────── */
function renderSlots() {
  slotsEl.innerHTML = Array.from({ length: PW_LEN }, (_, i) =>
    `<span class="slot" id="slot-${i}">_</span>`
  ).join("");
}

function updateSlots() {
  for (let i = 0; i < PW_LEN; i++) {
    const el = document.getElementById(`slot-${i}`);
    if (!el) continue;
    if (i < collected.length) {
      el.textContent = collected[i];
      el.classList.add("filled");
    } else {
      el.textContent = "_";
      el.classList.remove("filled");
    }
  }
}

/* ──────────────────────────────
   게임 열기 / 닫기 / 리셋
   ────────────────────────────── */
function openGame() {
  initCanvas();
  resetGame();
  renderSlots();
  setupTouchControls();
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
  collected = ""; letters = []; bullets = [];
  dropInterval = 860; shootCooldown = 0; msgTimer = 0;
  ship.x = CW / 2;
  gameMsgEl.textContent = "";
}

/* ──────────────────────────────
   스폰 — 맞춰야 할 글자는 숨김
   내려오는 글자는 모두 랜덤, 정답 글자도 랜덤하게 섞임
   (하이라이트 없음)
   ────────────────────────────── */
function spawnLetter() {
  const col = Math.floor(Math.random() * COL_COUNT);
  const needed = GAME_CONFIG.password[collected.length];
  // 35% 확률로 필요한 문자 포함 (표시는 일반 알파벳과 동일)
  const ch = (needed && Math.random() < 0.35)
    ? needed
    : ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  letters.push({
    x: col * COL_W + COL_W / 2,
    y: -12,
    ch,
    speed: 0.8 + Math.random() * 0.5,
    hit: false
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

  if (ts - lastDropTime > dropInterval) {
    spawnLetter();
    lastDropTime = ts;
    dropInterval = Math.max(440, dropInterval - 3);
  }

  if (shootCooldown > 0) shootCooldown--;
  if (msgTimer > 0) { msgTimer--; } else gameMsgEl.textContent = "";

  const spd = 3.8;
  if (keys["ArrowLeft"]  || keys["a"]) ship.x = Math.max(ship.w / 2, ship.x - spd);
  if (keys["ArrowRight"] || keys["d"]) ship.x = Math.min(CW - ship.w / 2, ship.x + spd);
  if ((keys[" "] || keys["ArrowUp"]) && shootCooldown === 0) {
    fireBullet(); shootCooldown = 15;
  }

  bullets.forEach(b => (b.y -= 9));
  bullets = bullets.filter(b => b.y > -20);
  letters.forEach(l => { if (!l.hit) l.y += l.speed; });
  letters = letters.filter(l => l.y < CH + 20 && !l.hit);

  // 충돌
  bullets.forEach(b => {
    letters.forEach(l => {
      if (l.hit) return;
      if (Math.abs(b.x - l.x) < 16 && Math.abs(b.y - l.y) < 16) {
        b.y = -9999; l.hit = true;
        onHit(l.ch);
      }
    });
  });

  draw();
  frameId = requestAnimationFrame(loop);
}

/* ──────────────────────────────
   명중 처리
   ────────────────────────────── */
function onHit(ch) {
  collected += ch;
  updateSlots();

  if (collected.length === PW_LEN) {
    // 7글자 완성 → 판정
    gameRunning = false;
    cancelAnimationFrame(frameId);
    setTimeout(() => {
      if (collected === GAME_CONFIG.password) {
        closeGame();
        showMessenger();
      } else {
        showGlitch();
      }
    }, 300);
    return;
  }

  // 아직 진행 중 — 오답 글자도 그냥 채움 (판정은 7글자 완성 후)
  gameMsgEl.textContent = "";
}

/* ──────────────────────────────
   성공: 메신저 팝업
   ────────────────────────────── */
function showMessenger() {
  messengerModal.classList.add("show");
  msgList.innerHTML = "";
  let i = 0;

  function showNext() {
    if (i >= MESSAGES.length) {
      // 마지막 — 삭제 연출
      setTimeout(startDeleteAnim, 800);
      return;
    }
    const m = MESSAGES[i++];
    const el = document.createElement("div");
    el.className = "msg-row msg-row--" + (m.speaker === "A" ? "a" : m.speaker === "B" ? "b" : "sys");
    if (m.speaker !== "SYSTEM") {
      el.innerHTML = `<span class="msg-name">${m.speaker === "A" ? "USER_A" : "USER_B"}</span>
        <span class="msg-bubble">${m.text}</span>`;
    } else {
      el.innerHTML = `<span class="msg-sys">${m.text}</span>`;
    }
    msgList.appendChild(el);
    msgList.scrollTop = msgList.scrollHeight;

    const delay = m.speaker === "SYSTEM" ? 1200 : 700 + m.text.length * 22;
    setTimeout(showNext, delay);
  }

  setTimeout(showNext, 600);
}

/* 삭제 애니메이션 */
function startDeleteAnim() {
  const rows = Array.from(msgList.children);
  let i = rows.length - 1;
  const iv = setInterval(() => {
    if (i < 0) {
      clearInterval(iv);
      // 빈 메신저 → 잠시 후 닫기
      setTimeout(() => {
        messengerModal.classList.remove("show");
        document.getElementById("screenMain").style.display = "flex";
      }, 1200);
      return;
    }
    rows[i].classList.add("msg-deleting");
    setTimeout(() => { rows[i].remove(); }, 400);
    i--;
  }, 180);
}

/* ──────────────────────────────
   실패: 글리치 오버레이
   ────────────────────────────── */
const GLITCH_CHARS = "█▓▒░▄▀■□◘◙†‡§¶⊕⊗∅∇∆∏∑√∞≈≠ΩΣΦΨΛΞαβγδεζφψωЖФЦЧШЩЭЮЯ字文語数エラー";
function rg() { return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]; }

function showGlitch() {
  closeGame();
  glitchOverlay.style.display = "flex";

  const lines = document.getElementById("glitchLines");
  const ERR_LINE = () => Array.from({length: 32}, rg).join("");
  lines.textContent = Array.from({length: 6}, ERR_LINE).join("\n");

  // 지속적으로 글리치 텍스트 갱신
  const iv = setInterval(() => {
    lines.textContent = Array.from({length: 6}, ERR_LINE).join("\n");
  }, 80);

  setTimeout(() => {
    clearInterval(iv);
    // 게임오버 팝업 표시
    document.getElementById("gameOverPopup").classList.add("show");
  }, 1800);
}

/* ──────────────────────────────
   터치 컨트롤 (모바일)
   왼쪽 절반 길게 누름 = 이동
   짧은 탭 = 발사
   ────────────────────────────── */
function setupTouchControls() {
  const cvs = canvas;
  let touchId   = null;
  let touchX    = null;
  let touchSide = null; // "left" | "right"
  let touchStart = 0;
  let moveInterval = null;
  const TAP_THRESHOLD = 180; // ms 이하 = 탭(발사)

  function startMove(side) {
    stopMove();
    moveInterval = setInterval(() => {
      const spd = 4.5;
      if (side === "left")  ship.x = Math.max(ship.w / 2, ship.x - spd);
      if (side === "right") ship.x = Math.min(CW - ship.w / 2, ship.x + spd);
    }, 16);
  }
  function stopMove() {
    clearInterval(moveInterval);
    moveInterval = null;
  }

  cvs.addEventListener("touchstart", e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    touchId    = t.identifier;
    touchX     = t.clientX;
    touchStart = Date.now();
    const rect = cvs.getBoundingClientRect();
    const relX = t.clientX - rect.left;
    touchSide  = relX < CW / 2 ? "left" : "right";
  }, { passive: false });

  cvs.addEventListener("touchmove", e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== touchId) continue;
      const rect = cvs.getBoundingClientRect();
      const relX = t.clientX - rect.left;
      const newSide = relX < CW / 2 ? "left" : "right";
      // 길게 누른 경우만 이동 시작
      if (Date.now() - touchStart > TAP_THRESHOLD) {
        if (newSide !== touchSide || !moveInterval) {
          touchSide = newSide;
          startMove(touchSide);
        }
      }
    }
  }, { passive: false });

  cvs.addEventListener("touchend", e => {
    e.preventDefault();
    stopMove();
    const elapsed = Date.now() - touchStart;
    if (elapsed < TAP_THRESHOLD) {
      // 짧은 탭 → 발사
      if (shootCooldown === 0) { fireBullet(); shootCooldown = 15; }
    }
    touchId = null; touchSide = null;
  }, { passive: false });
}

/* ──────────────────────────────
   그리기
   ────────────────────────────── */
function draw() {
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, CW, CH);

  // 컬럼 가이드
  ctx.strokeStyle = "#001800"; ctx.lineWidth = 0.5;
  for (let i = 1; i < COL_COUNT; i++) {
    ctx.beginPath(); ctx.moveTo(i * COL_W, 0); ctx.lineTo(i * COL_W, CH); ctx.stroke();
  }

  // 알파벳 (하이라이트 없이 모두 동일한 초록)
  const fs = Math.round(CW * 0.065);
  ctx.font = `${fs}px 'VT323', monospace`;
  ctx.textAlign = "center";
  letters.forEach(l => {
    if (l.hit) return;
    ctx.fillStyle = "#00cc00";
    ctx.fillText(l.ch, l.x, l.y);
  });

  // 총알
  ctx.fillStyle = "#00ffff";
  bullets.forEach(b => ctx.fillRect(b.x - 1.5, b.y - 8, 3, 10));

  // 바닥선
  ctx.strokeStyle = "#002200"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, CH - 28); ctx.lineTo(CW, CH - 28); ctx.stroke();

  // 전투기
  const x = ship.x, y = ship.y;
  ctx.fillStyle = "#00ff00";
  ctx.beginPath();
  ctx.moveTo(x, y - 14); ctx.lineTo(x - 10, y + 4);
  ctx.lineTo(x - 5, y + 2); ctx.lineTo(x - 5, y + 7);
  ctx.lineTo(x + 5, y + 7); ctx.lineTo(x + 5, y + 2);
  ctx.lineTo(x + 10, y + 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#003300"; ctx.fillRect(x - 2, y + 2, 4, 4);
}

/* ──────────────────────────────
   힌트
   ────────────────────────────── */
function toggleHint() {
  hintOpen = !hintOpen;
  hintBody.classList.toggle("open", hintOpen);
  hintToggle.textContent = (hintOpen ? "▼" : "▶") + " [HINT] 힌트 보기";
  if (hintOpen && !hintTyped) {
    hintTyped = true;
    hintCursor.style.display = "inline-block";
    typeText(hintTextEl, GAME_CONFIG.hintText, () => { hintCursor.style.display = "none"; });
  }
}

function typeText(el, text, cb = null, delay = 32) {
  let i = 0; el.textContent = "";
  const iv = setInterval(() => {
    if (i < text.length) { el.textContent += text[i++]; }
    else { clearInterval(iv); if (cb) cb(); }
  }, delay);
}
