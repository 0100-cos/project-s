/* ===========================
   CLASSIFIED SYSTEM - script.js
   =========================== */

/* ──────────────────────────────
   ★ 여기를 수정하세요 ★
   ────────────────────────────── */
const CONFIG = {
  /* 1차 비밀번호 */
  password1: "1234",

  /* 2차 비밀번호 (문서 해제 후 입력 시 숨겨진 일지 진입) */
  password2: "5678",

  /* 힌트 */
  hintText: [
    "힌트 1: 숫자로만 이루어져 있어요.",
    "힌트 2: 아주 익숙한 숫자 네 자리입니다.",
    "힌트 3: 1부터 4까지 순서대로..."
  ].join("\n"),

  /* 1차 비밀번호 성공 후 출력될 문서 내용 */
  secretText: [
    "▓▒░ 기밀 해제된 정보 ░▒▓",
    "",
    "이곳에 공개할 내용을 자유롭게 작성하세요.",
    "날짜 : [REDACTED]",
    "작성자 : SYSTEM",
    "",
    "C:\\SECRET> _"
  ].join("\n"),

  /* 동일 패스워드 입력 시 채팅 메시지 */
  samePwMsg: "같은걸 반복해선\n달라질게 없어.",

  /* 2차 패스워드 입력 시 경고 채팅 메시지 */
  newPwWarningMsg: "정말로 확인하시겠습니까?\n\n이 이상 들어오면\n다시는 못 나올 수도 있어요.",

  /* 숨겨진 일지 내용 */
  journalText: [
    "[ 일지 #001 ] 날짜 : [DATA EXPUNGED]",
    "",
    "오늘 처음으로 이 공간을 발견했다.",
    "아무도 여기까지 오리라 생각하지 않았겠지.",
    "",
    "[ 일지 #002 ] 날짜 : [DATA EXPUNGED]",
    "",
    "시스템은 살아있다. 계속 지켜보고 있다.",
    "이 글을 읽는다면, 이미 늦은 걸지도 모른다.",
    "",
    "[ 일지 #??? ] ...",
    "",
    "C:\\JOURNAL\\END> _"
  ].join("\n")
};

/* ──────────────────────────────
   상태
   ────────────────────────────── */
let isUnlocked  = false;  // 1차 비밀번호 해제 여부
let hintOpen    = false;
let hintTyped   = false;

/* ──────────────────────────────
   DOM
   ────────────────────────────── */
const pwInput       = document.getElementById("pwInput");
const enterBtn      = document.getElementById("enterBtn");
const promptLabel   = document.getElementById("promptLabel");
const secretContent = document.getElementById("secretContent");
const loadFill      = document.getElementById("loadFill");
const loadLabel     = document.getElementById("loadLabel");
const secretText    = document.getElementById("secretText");
const hintToggle    = document.getElementById("hintToggle");
const hintBody      = document.getElementById("hintBody");
const hintTextEl    = document.getElementById("hintText");
const hintCursor    = document.getElementById("hintCursor");

const modalOk       = document.getElementById("modalOk");
const modalErr      = document.getElementById("modalErr");
const modalSame     = document.getElementById("modalSame");
const modalNewPw    = document.getElementById("modalNewPw");

const okBtn         = document.getElementById("okBtn");
const closeErrBtn   = document.getElementById("closeErrBtn");
const closeSameBtn  = document.getElementById("closeSameBtn");
const newPwYes      = document.getElementById("newPwYes");
const newPwNo       = document.getElementById("newPwNo");
const newPwFooter   = document.getElementById("newPwFooter");
const chatMsgSame   = document.getElementById("chatMsgSame");
const chatCursorSame = document.getElementById("chatCursorSame");
const chatMsgNew    = document.getElementById("chatMsgNew");
const chatCursorNew = document.getElementById("chatCursorNew");

const screenMain    = document.getElementById("screenMain");
const screenJournal = document.getElementById("screenJournal");
const journalText   = document.getElementById("journalText");
const backBtn       = document.getElementById("backBtn");

/* ──────────────────────────────
   이벤트 등록
   ────────────────────────────── */
enterBtn.addEventListener("click", checkPassword);
pwInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkPassword(); });
okBtn.addEventListener("click", onFirstSuccess);
closeErrBtn.addEventListener("click", closeError);
closeSameBtn.addEventListener("click", () => closeModal(modalSame));
newPwYes.addEventListener("click", goToJournal);
newPwNo.addEventListener("click", () => closeModal(modalNewPw));
hintToggle.addEventListener("click", toggleHint);
backBtn.addEventListener("click", backToMain);

/* ──────────────────────────────
   비밀번호 확인 분기
   ────────────────────────────── */
function checkPassword() {
  const value = pwInput.value.trim();

  if (!isUnlocked) {
    /* ── 1차: 문서 해제 전 ── */
    if (value === CONFIG.password1) {
      showModal(modalOk);
    } else {
      triggerGlitchReset();
    }

  } else {
    /* ── 2차: 문서 해제 후 ── */
    if (value === CONFIG.password1) {
      /* 동일한 패스워드 */
      showChatSame();
    } else if (value === CONFIG.password2) {
      /* 새로운 패스워드 */
      showChatNewPw();
    } else {
      /* 완전히 틀린 패스워드 */
      triggerGlitchReset();
    }
  }
}

/* ──────────────────────────────
   모달 열기 / 닫기
   ────────────────────────────── */
function showModal(modal) { modal.classList.add("show"); }
function closeModal(modal) { modal.classList.remove("show"); pwInput.value = ""; }

/* ──────────────────────────────
   오류 모달 닫기
   ────────────────────────────── */
function closeError() {
  closeModal(modalErr);
  pwInput.focus();
}

/* ──────────────────────────────
   최초 성공: 로딩 → 문서 타이핑
   ────────────────────────────── */
function onFirstSuccess() {
  closeModal(modalOk);
  isUnlocked = true;
  promptLabel.textContent = "C:\\SYSTEM> 재입력 대기 중 :";

  secretContent.classList.add("show");
  let width = 0;
  const iv = setInterval(() => {
    width += 2;
    loadFill.style.width = width + "%";
    if (width >= 100) {
      clearInterval(iv);
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
   채팅 팝업 — 동일 패스워드
   ────────────────────────────── */
function showChatSame() {
  pwInput.value = "";
  chatMsgSame.textContent = "";
  chatCursorSame.style.display = "inline-block";
  showModal(modalSame);
  typeText(chatMsgSame, CONFIG.samePwMsg, () => {
    chatCursorSame.style.display = "none";
  });
}

/* ──────────────────────────────
   채팅 팝업 — 신규 패스워드 경고
   ────────────────────────────── */
function showChatNewPw() {
  pwInput.value = "";
  chatMsgNew.textContent = "";
  chatCursorNew.style.display = "inline-block";
  newPwFooter.style.display = "none";
  showModal(modalNewPw);
  typeText(chatMsgNew, CONFIG.newPwWarningMsg, () => {
    chatCursorNew.style.display = "none";
    newPwFooter.style.display = "flex";
  }, 40);
}

/* ──────────────────────────────
   YES 선택 → 숨겨진 일지
   ────────────────────────────── */
function goToJournal() {
  closeModal(modalNewPw);
  screenMain.style.display = "none";
  screenJournal.style.display = "flex";
  journalText.textContent = "";
  typeText(journalText, CONFIG.journalText, null, 28);
}

/* ──────────────────────────────
   일지 → 메인으로 돌아가기
   ────────────────────────────── */
function backToMain() {
  screenJournal.style.display = "none";
  screenMain.style.display = "flex";
  pwInput.value = "";
  pwInput.focus();
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
   글자 폭발 → 리셋
   ────────────────────────────── */
function triggerGlitchReset() {
  const container = document.querySelector(".container");
  const allText   = container.querySelectorAll(
    ".title, .label, .hint-toggle, .pw-input, .dos-btn, .secret-text, .load-label, .hint-body"
  );

  /* 각 요소의 글자를 span으로 쪼개서 날려버리기 */
  allText.forEach((el) => {
    const original = el.textContent;
    if (!original.trim()) return;
    el.innerHTML = original.split("").map((ch) => {
      const dx  = (Math.random() - 0.5) * 300;
      const dy  = (Math.random() - 0.5) * 300;
      const rot = (Math.random() - 0.5) * 720;
      return `<span class="char-explode" style="--dx:${dx}px;--dy:${dy}px;--rot:${rot}deg">${ch === " " ? "&nbsp;" : ch}</span>`;
    }).join("");
  });

  /* 0.8초 후 페이지 전체 리로드 */
  setTimeout(() => {
    location.reload();
  }, 900);
}

/* ──────────────────────────────
   타이핑 효과 (공통)
   ────────────────────────────── */
function typeText(element, text, onComplete = null, delay = 32) {
  let i = 0;
  element.textContent = "";
  const iv = setInterval(() => {
    if (i < text.length) {
      element.textContent += text[i];
      i++;
    } else {
      clearInterval(iv);
      if (onComplete) onComplete();
    }
  }, delay);
}
