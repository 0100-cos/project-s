/* ===========================
   CLASSIFIED SYSTEM - script.js
   =========================== */

/* ──────────────────────────────
   ★ 여기를 수정하세요 ★
   ────────────────────────────── */
const CONFIG = {
  /* 1차 비밀번호 */
  password1: "penguin",

  /* 2차 비밀번호 (문서 해제 후 입력 시 숨겨진 일지 진입) */
  password2: "solomon",

  /* 힌트 */
  hintText: [
    " 1: 아무것도 없는 광활한 대지를 두발로 걷는 것.",
    " 2: 곧잘 넘어져도 일어서는 것.",
    " 3: 함께의 가치를 무엇보다 잘 아는 것."
  ].join("\n"),

  /* 1차 비밀번호 성공 후 출력될 문서 내용 */
  secretText: [
    "▓▒░ Project_S::활성화 ░▒▓",
    "",
    "프로젝트 솔로몬. 고차원적 존재의 힘을 빌려 괴담으로부터 안전한 세상을 만들 초석을 다지기로 하였다.\n 고차원적 존재인 만큼 착한친구 같은 단순 필터링방식으로는 위험이 크다.\n 여러 개체로 나누어서 계약자에게 우호적이며 현명한 인격을 덮어 씌우는 방식으로 추진.",
    "날짜 : [202x-0x-xx]",
    "작성자 : 해당연구는 연구원의 안전을 위해 무기명으로 진행된다.",
    "",
    "C:\\SECRET>solomon_"
  ].join("\n"),

  /* 동일 패스워드 입력 시 채팅 메시지 */
  samePwMsg: "반복되는건\n당신 뿐.\n새로운 변수에 대한 갈망은 연구원의 소양이죠.",

  /* 2차 패스워드 입력 시 경고 채팅 메시지 */
  newPwWarningMsg: "호기심은 고양이를 죽인다 하던가요?\n\n어차피,\n상자 속 고양이는\n살았지만 죽어있고, 이제 선택은 당신의 몫이에요.",

  /* 숨겨진 일지 내용 */
  journalText: [
    "[ 일지 #001 ] 날짜 : [DATA EXPUNGED]",
    "",
    "프로젝트 진행은 순조롭다.",
    "우리가 접촉하고자 하는 존재는 너무나 거대하여 \n 직접적으로 도움을 요청하는 경우, 분명 감당하기 힘든 일이 발생할 것이다. \n그러니 세계의 영향을 끼치지 않고 조언을 구하는 형태로 영향을 최소하 하기로 하였다.",
    "",
    "[ 일지 #002 ] 날짜 : [DATA EXPUNGED]",
    "",
    "프로젝트 진행은 순조롭다. 나는 알고 있다.",
    "착한친구는 자아가, 의식이 있는 존재, 어디까지나 인간과 비슷한 인지 체계를 가진-가치관은 다를지라도- 존재를 대상으로 이루어진다.",
    "이것은, 그렇지 않다. 초월이란 이성이라는 인간이 추구하는 얄팍한 가치로 재단할 수 없다. 잠들어 있는 그것은 자아도, 이성도, 감정도 없는 의지의 덩어리이니,",
    "그 의지의 파편을 우리와 소통가능한 자아체로 잘 포장해야한다는 의미다.",
    "",
    "[ 일지 #??? ] ...",
    "프로젝트는 중단되었다. 이미 시판 된 키트를 빨리 회수하기 위해 모두가 고군분투한다.",
    "우리의 기술력으로는 통제 가능한 수준의 위험도가 아니었다.",
    "잠든 그것의 파편을 솔로몬으로 만들기 위해, 우리가 알지 못하는 현명한 누군가가 희생되어야했다. 안전핀처럼.",
    "이 귀여운 펭귄인형 키트는 전부 처분되겠지. 대를 위해 소를 희생할 순 없는 노릇아닌가.",
    "물론 내 서랍 안, 간식과 섞여있는 프로토타입은 반납하지 않을 것이다.",
    "괜찮다. 나는 알고 있으니까",
    "이 인형에 솜으로 전락할 안타까운 희생자가 누군지.",
    "사실,",
    "내가 누구였는지 따위 기억은 안나지만",
    "...",
    "무지한 당신의 실수인 동시에",
    "이 연구원의 선택으로",
    "나는 붕괴했고",
    "고로, 존재한다.",
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
      showModal(modalErr);
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
   글리치 붕괴 → 리셋
   글자가 노이즈 문자로 교체되며 지직거리다가 리셋
   ────────────────────────────── */

/* DOS/CRT 느낌의 노이즈 문자 풀 */
const GLITCH_CHARS = "█▓▒░▄▀■□▪▫◘◙◦†‡§¶※⊕⊗⊘∅∇∆∏∑√∞∫≈≠≡≤≥⌂⌐¬ΩΣΦΨΛΞαβγδεζθλμπρσφψωЖФЦЧШЩЪЫЬЭЮЯ字文語数国際エラーエラー";

function randomGlyphFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

/* 화면 전체 텍스트 노드를 수집 */
function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function triggerGlitchReset() {
  const container = document.querySelector(".container");

  /* 1) 원본 텍스트 수집 */
  const nodes = collectTextNodes(container);
  const originals = nodes.map((n) => n.nodeValue);

  /* 총 글자 수 */
  const totalChars = originals.reduce((s, t) => s + t.length, 0);

  /* 2) 글리치 루프: 빠르게 랜덤 교체 반복 */
  const TOTAL_MS   = 1800;  /* 전체 효과 시간 */
  const TICK_MS    = 40;    /* 교체 주기 */
  const ticks      = Math.floor(TOTAL_MS / TICK_MS);
  let   tick       = 0;
  /* 후반부로 갈수록 더 많은 글자가 무너짐 */

  /* CSS로 화면 전체 흔들기 */
  container.style.animation = "glitchShake 0.08s infinite";

  /* 빨간 오류 색상 점진적 적용 */
  container.style.transition = "color 0.3s";
  setTimeout(() => { container.style.color = "#ff2200"; }, 100);
  setTimeout(() => { container.style.color = "#ff6600"; }, 500);
  setTimeout(() => { container.style.color = "#ff0000"; }, 900);

  const iv = setInterval(() => {
    tick++;
    const corruptRatio = Math.min(1, (tick / ticks) * 1.4); /* 0→1 가속 */

    nodes.forEach((node, ni) => {
      const orig = originals[ni];
      let result = "";
      for (let ci = 0; ci < orig.length; ci++) {
        const ch = orig[ci];
        if (ch === " " || ch === "\n") { result += ch; continue; }
        /* 후반부 글자일수록 먼저 붕괴 */
        const posRatio = ci / orig.length;
        const corruptChance = corruptRatio * (0.4 + posRatio * 0.6);
        if (Math.random() < corruptChance) {
          result += randomGlyphFrom(GLITCH_CHARS);
        } else {
          result += ch;
        }
      }
      node.nodeValue = result;
    });

    /* 마지막 몇 틱: 완전 노이즈로 채우기 */
    if (tick >= ticks - 4) {
      nodes.forEach((node, ni) => {
        const len = originals[ni].replace(/\s/g, "").length;
        node.nodeValue = Array.from({ length: originals[ni].length }, (_, i) =>
          /\s/.test(originals[ni][i]) ? originals[ni][i] : randomGlyphFrom(GLITCH_CHARS)
        ).join("");
      });
    }

    if (tick >= ticks) {
      clearInterval(iv);
      container.style.animation = "";
      setTimeout(() => location.reload(), 120);
    }
  }, TICK_MS);
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
