const introPanel = document.getElementById("introPanel");
const debatePanel = document.getElementById("debatePanel");
const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("questionInput");
const debateQuestion = document.getElementById("debateQuestion");
const conversation = document.getElementById("conversation");
const progressBar = document.getElementById("progressBar");
const turnCount = document.getElementById("turnCount");
const roundMap = document.getElementById("roundMap");
const qualityValue = document.getElementById("qualityValue");
const qualityBar = document.getElementById("qualityBar");
const qualityNote = document.getElementById("qualityNote");
const pauseButton = document.getElementById("pauseButton");
const newDebateButton = document.getElementById("newDebateButton");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");

let selectedRounds = 3;
let runId = 0;
let paused = false;

const sampleProfiles = [
  {
    match: ["사이드", "수익", "프로젝트"],
    thesis: "기능을 더 만드는 것보다, 돈을 낼 한 사람의 구체적인 문제를 먼저 검증하는 편이 현실적입니다.",
    gpt: "3개월이라는 제한이 있으므로 ‘작게 만들고 빠르게 파는’ 순서가 핵심입니다. 1~2주차에는 잠재 고객 15명을 인터뷰해 반복되는 문제를 하나 고르고, 3~5주차에는 그 문제만 해결하는 유료 MVP를 만드세요.",
    claude: "속도에는 동의하지만 인터뷰 수 자체가 검증은 아닙니다. 사람들이 불편하다고 말하는 것과 실제 결제는 다르므로, 개발 전에 선결제나 유료 파일럿을 제안해 지불 의사를 확인해야 합니다.",
    synthesis: "둘의 관점을 합치면 개발보다 판매가 먼저입니다. 좁은 고객군, 측정 가능한 문제, 유료 파일럿이라는 세 가지 조건을 통과한 아이디어에만 제작 시간을 써야 합니다.",
    actions: ["10명에게 문제 인터뷰", "유료 파일럿 3건 제안", "반응이 있는 1개만 MVP 제작"]
  },
  {
    match: ["디자이너", "AI", "역량"],
    thesis: "도구 숙련보다 문제를 정의하고 결과의 품질을 판별하는 능력이 더 오래가는 경쟁력입니다.",
    gpt: "AI 도구를 빠르게 다루는 능력과 함께, 제품 맥락을 구조화하고 프로토타입을 반복하는 속도를 키워야 합니다. 프롬프트 자체보다 리서치·정보 구조·인터랙션 설계를 한 흐름으로 연결하는 연습이 중요합니다.",
    claude: "다만 생산 속도만 강조하면 결과물이 평준화될 수 있습니다. 좋은 디자이너의 차이는 무엇을 만들지 판단하는 안목, 사용자에게 질문하는 태도, 그리고 AI 결과물의 결함을 알아보는 비평 능력에서 생깁니다.",
    synthesis: "AI를 ‘그려주는 도구’가 아니라 사고를 확장하는 동료로 쓰되, 문제 정의와 편집권은 디자이너가 가져야 합니다. 도구·도메인·비평의 세 축을 함께 훈련하는 전략이 가장 안전합니다.",
    actions: ["주 1회 AI 프로토타입", "도메인 지식 하나 깊게", "결과물 비평 로그 작성"]
  },
  {
    match: ["서울", "여행", "2박"],
    thesis: "명소 수를 늘리기보다 동네별 리듬을 묶어 이동 피로를 줄이는 일정이 좋습니다.",
    gpt: "첫날은 서촌–경복궁–을지로, 둘째 날은 성수–서울숲–한강, 마지막 날은 해방촌–남산처럼 하루에 한 권역만 잡으면 서울의 서로 다른 표정을 경험하면서도 이동이 단순해집니다.",
    claude: "동선은 좋지만 ‘처음 만나는 사람’이라는 조건을 더 반영해야 합니다. 오래 마주 보는 식사만 이어지면 부담스러울 수 있으니, 전시·산책·시장처럼 대화와 침묵이 자연스럽게 섞이는 활동을 배치하는 편이 좋습니다.",
    synthesis: "지역별로 하루를 묶고, 각 날을 ‘함께 보기–나란히 걷기–마주 앉기’의 리듬으로 설계하세요. 일정의 절반은 예약하지 않고 남겨 두는 것이 관계와 날씨 변화에 대응하기 좋습니다.",
    actions: ["하루 한 권역만 선택", "활동·산책·식사 순서", "일정 50%는 여백으로"]
  },
  {
    match: ["주 4일", "생산성", "팀"],
    thesis: "전면 도입보다 8주간의 측정 가능한 실험으로 판단하는 것이 안전합니다.",
    gpt: "주 4일제는 시간을 줄이는 제도가 아니라 낮은 가치의 회의와 업무를 제거하는 운영 재설계에 가깝습니다. 8주 파일럿을 진행하며 산출량, 리드타임, 고객 응답 속도, 팀 만족도를 함께 측정하세요.",
    claude: "평균 생산성만 보면 숨은 비용을 놓칠 수 있습니다. 특정 직원의 업무 압축, 금요일 고객 대응 공백, 휴가 사용 감소 같은 부작용도 추적해야 합니다. 팀별 업무 특성에 따라 같은 제도를 강제하지 않는 것도 중요합니다.",
    synthesis: "도입 여부를 찬반으로 결정하지 말고, 팀별 8주 실험으로 검증하세요. 업무량은 그대로 둔 채 근무일만 줄이지 말고, 회의·승인·보고 절차를 먼저 줄인 뒤 성과와 부담을 동시에 측정해야 합니다.",
    actions: ["저가치 업무 20% 제거", "8주간 팀별 파일럿", "성과·피로 지표 동시 측정"]
  }
];

function genericProfile(question) {
  const focus = escapeHTML(question.replace(/[?!.]/g, "").slice(0, 28));
  return {
    thesis: "정답을 바로 고르기보다, 목표와 제약을 먼저 분리하면 더 좋은 판단을 할 수 있습니다.",
    gpt: "이 질문은 하나의 선택처럼 보이지만 실제로는 목표, 시간, 비용, 되돌릴 수 있는 정도를 나눠 봐야 합니다. 먼저 ‘" + focus + "’에서 얻고 싶은 결과를 한 문장으로 정의하고, 각 선택지를 같은 기준으로 비교하는 것이 좋습니다.",
    claude: "구조화된 비교는 유용하지만 숫자로 표현하기 어려운 맥락도 있습니다. 특히 누가 영향을 받는지, 실패했을 때 회복 가능한지, 지금 결정하지 않는 선택지는 무엇인지까지 살펴야 성급한 결론을 피할 수 있습니다.",
    synthesis: "두 관점을 합치면 지금 필요한 것은 완벽한 예측이 아니라 작은 검증입니다. 목표를 하나로 좁히고, 실패 비용이 낮은 실험을 먼저 실행한 뒤 실제 데이터로 다음 결정을 업데이트하세요.",
    actions: ["성공 기준 1개 정의", "가장 큰 가정 1개 검증", "2주 뒤 데이터로 재결정"]
  };
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, function(character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character];
  });
}

function findProfile(question) {
  return sampleProfiles.find(function(profile) {
    return profile.match.some(function(keyword) {
      return question.toLowerCase().includes(keyword.toLowerCase());
    });
  }) || genericProfile(question);
}

function getDepthLabel() {
  const value = document.getElementById("depthSelect").value;
  if (value === "critical") return "비판 검토";
  if (value === "creative") return "확장 제안";
  return "균형 검토";
}

function messageHTML(role, label, tag, text, extras) {
  const avatar = role === "gpt" ? "G" : "C";
  let list = "";
  if (extras && extras.length) {
    list = "<ul>" + extras.map(function(item) { return "<li>" + item + "</li>"; }).join("") + "</ul>";
  }
  return '<article class="message ' + role + '">' +
    '<div class="message-avatar">' + avatar + "</div>" +
    "<div>" +
      '<div class="message-meta"><b>' + label + '</b><span class="message-tag">' + tag + "</span><span>방금 전</span></div>" +
      '<div class="message-text"><p>' + text + "</p>" + list + "</div>" +
    "</div>" +
  "</article>";
}

function setStage(stage, total) {
  const percent = Math.round((stage / total) * 100);
  progressBar.style.width = percent + "%";
  turnCount.textContent = stage + " / " + total + " turns";
  Array.from(roundMap.children).forEach(function(item, index) {
    item.classList.toggle("active", index === stage - 1);
    item.classList.toggle("done", index < stage - 1);
  });
  const quality = [24, 47, 73, 96][stage - 1] || 96;
  const notes = [
    "두 관점을 수집하고 있어요.",
    "반론을 통해 허점을 줄이고 있어요.",
    "공통 원칙을 하나로 묶고 있어요.",
    "합의된 실행안을 완성했어요."
  ];
  qualityValue.textContent = quality + "%";
  qualityBar.style.width = quality + "%";
  qualityNote.textContent = notes[stage - 1];
}

function thinkingHTML(label) {
  return '<div class="thinking"><div class="thinking-orb"><i></i></div><p>' + label + "</p></div>";
}

function waitWhilePaused(id) {
  return new Promise(function(resolve) {
    function check() {
      if (id !== runId) return resolve(false);
      if (!paused) return resolve(true);
      setTimeout(check, 160);
    }
    check();
  });
}

function delay(ms, id) {
  return new Promise(function(resolve) {
    setTimeout(async function() {
      const allowed = await waitWhilePaused(id);
      resolve(allowed);
    }, ms);
  });
}

function scrollLatest() {
  const last = conversation.lastElementChild;
  if (last) last.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function addThinking(label) {
  conversation.insertAdjacentHTML("beforeend", thinkingHTML(label));
  scrollLatest();
}

function replaceThinking(html) {
  const thinking = conversation.querySelector(".thinking:last-child");
  if (thinking) thinking.remove();
  conversation.insertAdjacentHTML("beforeend", html);
  scrollLatest();
}

function finalHTML(profile, question) {
  return '<section class="final-answer">' +
    '<div class="final-top">' +
      '<div><span class="final-kicker">CONSENSUS · 최종 합의안</span><h3>' + profile.thesis + "</h3></div>" +
      '<button class="copy-button" type="button" aria-label="최종 답변 복사"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h11v11H8zM5 16V5h11"/></svg></button>' +
    "</div>" +
    '<div class="final-body">' +
      "<p>" + profile.synthesis + "</p>" +
      '<div class="action-plan">' +
        profile.actions.map(function(action, index) {
          return '<div class="action-item"><span>0' + (index + 1) + '</span><b>' + action + "</b></div>";
        }).join("") +
      "</div>" +
      '<div class="consensus-foot">' +
        '<div class="consensus-models"><i class="gpt-orb">G</i><i class="claude-orb">C</i><span>GPT × Claude 합의</span></div>' +
        "<span>질문: " + escapeHTML(question.slice(0, 35)) + (question.length > 35 ? "…" : "") + "</span>" +
      "</div>" +
    "</div>" +
  "</section>";
}

async function runDebate(question) {
  const id = ++runId;
  paused = false;
  pauseButton.classList.remove("is-paused");
  const profile = findProfile(question);
  const total = 4;

  introPanel.hidden = true;
  debatePanel.hidden = false;
  debateQuestion.textContent = question;
  conversation.innerHTML = "";
  setStage(1, total);
  window.scrollTo({ top: 0, behavior: "smooth" });

  addThinking("GPT가 문제를 구조화하고 있어요");
  if (!await delay(850, id) || id !== runId) return;
  replaceThinking(messageHTML("gpt", "GPT", "초안 제시", profile.gpt, ["목표와 제약 분리", "작게 검증할 수 있는 단위 설정"]));

  addThinking("Claude가 전제와 놓친 맥락을 검토하고 있어요");
  if (!await delay(950, id) || id !== runId) return;
  setStage(2, total);
  replaceThinking(messageHTML("claude", "Claude", getDepthLabel(), profile.claude, ["숨은 비용과 반대 사례 확인", "실패했을 때의 회복 가능성 점검"]));

  if (selectedRounds >= 3) {
    addThinking("GPT가 반론을 반영해 해답을 다듬고 있어요");
    if (!await delay(900, id) || id !== runId) return;
    setStage(3, total);
    replaceThinking(messageHTML("gpt", "GPT", "관점 통합", profile.synthesis, profile.actions.slice(0, 2)));
  } else {
    setStage(3, total);
  }

  if (selectedRounds === 4) {
    addThinking("Claude가 마지막 예외 조건을 확인하고 있어요");
    if (!await delay(850, id) || id !== runId) return;
    replaceThinking(messageHTML("claude", "Claude", "최종 검증", "이 결론은 한 번에 크게 실행할 때보다 작은 실험으로 시작할 때 유효합니다. 결과를 평가할 날짜와 중단 조건까지 미리 정하면 확신이 아니라 근거로 다음 결정을 내릴 수 있습니다."));
  }

  addThinking("두 관점의 공통점을 최종 답변으로 정리하고 있어요");
  if (!await delay(950, id) || id !== runId) return;
  setStage(4, total);
  const thinking = conversation.querySelector(".thinking:last-child");
  if (thinking) thinking.remove();
  conversation.insertAdjacentHTML("beforeend", finalHTML(profile, question));
  bindCopy();
  scrollLatest();
}

function bindCopy() {
  const button = conversation.querySelector(".copy-button");
  if (!button) return;
  button.addEventListener("click", async function() {
    const final = conversation.querySelector(".final-answer");
    const text = final ? final.innerText.replace("CONSENSUS · 최종 합의안", "").trim() : "";
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    toast.classList.add("show");
    setTimeout(function() { toast.classList.remove("show"); }, 1800);
  });
}

questionForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const value = questionInput.value.trim();
  if (value) runDebate(value);
});

questionInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    questionForm.requestSubmit();
  }
});

document.querySelectorAll(".prompt-chip").forEach(function(button) {
  button.addEventListener("click", function() {
    const prompt = button.dataset.prompt;
    questionInput.value = prompt;
    sidebar.classList.remove("open");
    setTimeout(function() { runDebate(prompt); }, 140);
  });
});

document.querySelectorAll("#roundSelector button").forEach(function(button) {
  button.addEventListener("click", function() {
    document.querySelectorAll("#roundSelector button").forEach(function(item) { item.classList.remove("active"); });
    button.classList.add("active");
    selectedRounds = Number(button.dataset.rounds);
  });
});

pauseButton.addEventListener("click", function() {
  paused = !paused;
  pauseButton.classList.toggle("is-paused", paused);
  pauseButton.setAttribute("aria-label", paused ? "토론 계속하기" : "토론 일시정지");
});

newDebateButton.addEventListener("click", function() {
  runId += 1;
  paused = false;
  debatePanel.hidden = true;
  introPanel.hidden = false;
  questionInput.value = "";
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(function() { questionInput.focus(); }, 350);
});

document.getElementById("themeButton").addEventListener("click", function() {
  document.body.classList.toggle("light");
});

document.getElementById("mobileMenu").addEventListener("click", function() {
  sidebar.classList.toggle("open");
});

document.addEventListener("click", function(event) {
  if (window.innerWidth <= 740 && sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) && !event.target.closest("#mobileMenu")) {
    sidebar.classList.remove("open");
  }
});
