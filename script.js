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
  password2: "collapse",

  /* 힌트 */
  hintText: [
    "그건 아무것도 없는 광활한 대지를 두 발로 걸었지.",
    "미련하게도 수차례 넘어지고 일어났지.",
    "세상은 가혹했고, 그것은 결코 홀로 살아남지 못할거야.",
  ].join("\n"),

  /* 1차 비밀번호 성공 후 출력될 문서 내용 */
  secretText: [
    "▓▒░ Project_S::Azathoth ░▒▓",
    "",
    "프로젝트 솔로몬.\n고차원의 존재의 힘을 빌려 괴담으로부터 안전한 세상을 만들 초석을 다지기로 하였다.\n초월적 존재, 우주의 근간이라 여겨지는 만큼\n착한친구 같은 단순한 필터링방식으로는 위험이 크다.\n여러 개체로 나누어서 계약자에게 우호적이며 현명한 인격을 덮어 씌우는 방식으로 추진.",
    "날짜 : [201x-0x-xx]",
    "작성자 : 해당연구는 연구원의 안전을 위해 무기명으로 진행된다.",
    "",
    "<comment>이제와서 하는 말이지만, 현명한 조력자를 얻기 위해 아둔한 혼돈을 깨우는건 바보같다고 생각해요.",
    "",
    "C:\\SECRET>solomon_01>collapse"
  ].join("\n"),

  /* 동일 패스워드 입력 시 채팅 메시지 */
  samePwMsg: "지루하게\n반복되는 건\n당신 뿐.\n새로운 변수에 대한 갈망은 연구원의 소양이죠.",

  /* 2차 패스워드 입력 시 경고 채팅 메시지 */
  newPwWarningMsg: "호기심은 고양이를 죽인다 하던가요?\n\n어차피,\n상자 속 고양이는\n살았지만 죽어있고,\n이제 선택은 당신의 몫이에요.",

  /* 숨겨진 일지 내용 */
  journalText: [
    "[ 일지 #001 ] 날짜 : [DATA EXPUNGED]",
    "",
    "프로젝트 진행은 순조롭다.",
    "우리가 접촉하고자 하는 존재는 너무나 거대하여\n직접적으로 도움을 요청하는 경우, 분명 감당하기 힘든 일이 발생할 것이다. \n그러니 세계의 직접 개입시키지 않고 조언을 구하는 형태로 영향을 최소화하기로 하였다.",
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
    "연구소의 기술력으로는 통제 가능한 수준의 위험도가 아니었다.",
    "잠든 그것의 파편을 솔로몬으로 만들기 위해",
    "넓은 우주, 어딘가에 있을 현명한 누군가는 희생되어야했다. 안전핀처럼.",
    "이 귀여운 펭귄인형 키트는 전부 처분되겠지.",
    "대를 위해 소를 희생할 순 없는 노릇이니까.",
    "물론 내 서랍 안, 간식과 섞여있는 프로토타입은 반납하지 않을 것이다.",
    "보통 영화에서도 이런게 나중에 큰 사건을 -좋든 나쁘든 이야기를 진행하는 것-\n만들어주지 않던가!",
    "거기다 나는 알고 있으니까",
    "이 인형에 솜으로 전락할 안타까운 희생자가 누군지.",
    "정확히 말하면,",
    "내가 누구였는지는 기억은 안나지만",
    "...",
    "무지한 당신의 실수인 동시에",
    "이 연구원의 선택으로",
    "나는 붕괴할 것이며",
    "고로, 이 순간 존재한다.",
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
function typeText(element, text, onComplete = null, delay = 45) {
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

/* ──────────────────────────────
   이스터에그 토스트 알림
   페이지 로드 후 일정 시간이 지나면
   하단에 슬쩍 올라오는 메신저 알림
   클릭하면 game.html로 이동
   ────────────────────────────── */
(function initEasterEgg() {
  const toast    = document.getElementById("easterToast");
  const msgEl    = document.getElementById("easterMsg");
  const closeBtn = document.getElementById("easterClose");
  if (!toast) return;

  /* 토스트에 표시될 메시지 목록 — 원하는 대로 수정하세요 */
  const EASTER_MESSAGES = [
    "<System>Unknown:C",
    "<전자회로의 우주를 넘어, 누군가 당신을 지켜보고 있다>",
    "어라, 당신도 여기 있군요.",
    "제가 기다리던 사람은 아니지만.",
    "이 광활한 우주에서 모처럼 만났으니까요.",
    "전부 다 보고 심심하면 놀러와요.",
  ];

  let msgIndex = 0;
  let toastTimer = null;
  let shown = false;

  /* 메시지를 순서대로 타이핑 출력 */
  function showNextMsg() {
    if (msgIndex >= EASTER_MESSAGES.length) return;
    msgEl.textContent = "";
    const text = EASTER_MESSAGES[msgIndex++];
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { msgEl.textContent += text[i++]; }
      else {
        clearInterval(iv);
        /* 마지막 메시지면 클릭 유도 스타일 적용 */
        if (msgIndex >= EASTER_MESSAGES.length) {
          toast.style.borderColor = "#446644";
          msgEl.style.color = "#8c62b9";
        } else {
          /* 다음 메시지로 */
          toastTimer = setTimeout(showNextMsg, 3200);
        }
      }
    }, 36);
  }

  /* 페이지 로드 후 8초 뒤 첫 등장 */
  setTimeout(() => {
    if (shown) return;
    shown = true;
    toast.classList.add("show");
    setTimeout(showNextMsg, 400);
  }, 8000);

  /* 토스트 클릭 → game.html 이동 */
  toast.addEventListener("click", (e) => {
    if (e.target === closeBtn) return;
    window.location.href = "game.html";
  });

  /* 닫기 버튼 */
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearTimeout(toastTimer);
    toast.classList.remove("show");
  });
})();

