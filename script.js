/* ===========================
   CLASSIFIED SYSTEM - script.js
   =========================== */

/* ──────────────────────────────
   ★ 여기를 수정하세요 ★
   비밀번호, 힌트, 공개될 내용
   ────────────────────────────── */

const CONFIG = {
  /* 비밀번호 */
  password: "1234",

  /* 힌트 텍스트 (줄바꿈은 \n 사용) */
  hintText: [
    "힌트 1: 숫자로만 이루어져 있어요.",
    "힌트 2: 아주 익숙한 숫자 네 자리입니다.",
    "힌트 3: 1부터 4까지 순서대로..."
  ].join("\n"),

  /* 비밀번호 성공 후 출력될 내용 */
  secretText: [
    "▓▒░ 기밀 해제된 정보 ░▒▓",
    "",
    "이곳에 공개할 내용을 자유롭게 작성하세요.",
    "날짜: 2025-01-01",
    "작성자: SYSTEM",
    "",
    "C:\\SECRET> _"
  ].join("\n")
};

/* ──────────────────────────────
   DOM 요소 참조
   ────────────────────────────── */
const pwInput      = document.getElementById("pwInput");
const enterBtn     = document.getElementById("enterBtn");
const modalOk      = document.getElementById("modalOk");
const modalErr     = document.getElementById("modalErr");
const okBtn        = document.getElementById("okBtn");
const closeErrBtn  = document.getElementById("closeErrBtn");
const secretContent = document.getElementById("secretContent");
const loadFill     = document.getElementById("loadFill");
const loadLabel    = document.getElementById("loadLabel");
const secretText   = document.getElementById("secretText");
const hintToggle   = document.getElementById("hintToggle");
const hintBody     = document.getElementById("hintBody");
const hintTextEl   = document.getElementById("hintText");
const hintCursor   = document.getElementById("hintCursor");

/* ──────────────────────────────
   상태 변수
   ────────────────────────────── */
let hintOpen   = false;
let hintTyped  = false;

/* ──────────────────────────────
   이벤트 리스너 등록
   ────────────────────────────── */
enterBtn.addEventListener("click", checkPassword);
pwInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkPassword();
});
hintToggle.addEventListener("click", toggleHint);
okBtn.addEventListener("click", onSuccess);
closeErrBtn.addEventListener("click", closeError);

/* ──────────────────────────────
   비밀번호 확인
   ────────────────────────────── */
function checkPassword() {
  const value = pwInput.value.trim();
  if (value === CONFIG.password) {
    showModal(modalOk);
  } else {
    showModal(modalErr);
  }
}

/* ──────────────────────────────
   모달 열기 / 닫기
   ────────────────────────────── */
function showModal(modal) {
  modal.classList.add("show");
}

function closeModal(modal) {
  modal.classList.remove("show");
}

/* ──────────────────────────────
   오류 모달 닫기
   ────────────────────────────── */
function closeError() {
  closeModal(modalErr);
  pwInput.value = "";
  pwInput.focus();
}

/* ──────────────────────────────
   성공: 로딩 → 비밀 내용 타이핑
   ────────────────────────────── */
function onSuccess() {
  closeModal(modalOk);

  secretContent.classList.add("show");

  let width = 0;
  const loadingInterval = setInterval(() => {
    width += 2;
    loadFill.style.width = width + "%";

    if (width >= 100) {
      clearInterval(loadingInterval);
      loadLabel.textContent = "■ 로딩 완료. 정보를 출력합니다...";

      setTimeout(() => {
        loadLabel.style.display = "none";
        loadFill.parentElement.style.display = "none";
        secretText.style.display = "block";
        typeText(secretText, CONFIG.secretText);
      }, 700);
    }
  }, 30);
}

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
    typeText(hintTextEl, CONFIG.hintText, () => {
      hintCursor.style.display = "none";
    });
  }
}

/* ──────────────────────────────
   타이핑 효과 (공통 함수)
   delay : 글자 간 ms
   ────────────────────────────── */
function typeText(element, text, onComplete = null, delay = 32) {
  let i = 0;
  element.textContent = "";

  const interval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text[i];
      i++;
    } else {
      clearInterval(interval);
      if (onComplete) onComplete();
    }
  }, delay);
}
