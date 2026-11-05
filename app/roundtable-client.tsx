"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Role = "gpt" | "claude";
type Mode = "checking" | "demo" | "live";

type DebateMessage = {
  role: Role;
  label: "GPT" | "Claude";
  tag: string;
  text: string;
};

type DebateResult = {
  mode: "demo" | "live";
  messages: DebateMessage[];
  final: {
    thesis: string;
    summary: string;
    actions: [string, string, string];
  };
  models: {
    openai: string;
    anthropic: string;
  };
};

const prompts = [
  {
    title: "사이드 프로젝트 수익화 전략",
    prompt: "3개월 안에 사이드 프로젝트를 수익화하려면 어떤 전략이 가장 현실적일까?",
  },
  {
    title: "AI 시대의 디자이너 역량",
    prompt: "AI 시대에 디자이너가 경쟁력을 유지하려면 무엇을 배워야 할까?",
  },
  {
    title: "서울 2박 3일 여행 설계",
    prompt: "서울에서 처음 만나는 사람과 2박 3일 여행을 한다면 어떤 일정이 좋을까?",
  },
  {
    title: "주 4일제 도입 검토",
    prompt: "우리 팀에 주 4일제를 도입해도 생산성을 유지할 수 있을까?",
  },
];

const stages = [
  { title: "초안 제시", detail: "GPT의 첫 접근" },
  { title: "교차 검증", detail: "Claude의 반론" },
  { title: "관점 통합", detail: "논리 보완" },
  { title: "최종 답변", detail: "합의안 정리" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 14 0m-5-5 5 5-5 5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function RoundtableClient() {
  const [question, setQuestion] = useState("");
  const [activeQuestion, setActiveQuestion] = useState("");
  const [rounds, setRounds] = useState(3);
  const [depth, setDepth] = useState("balanced");
  const [view, setView] = useState<"intro" | "debate">("intro");
  const [mode, setMode] = useState<Mode>("checking");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1);
  const [result, setResult] = useState<DebateResult | null>(null);
  const [error, setError] = useState("");
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { mode?: Mode }) => setMode(data.mode === "live" ? "live" : "demo"))
      .catch(() => setMode("demo"));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light", light);
  }, [light]);

  useEffect(() => {
    if (!loading) return;
    const interval = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, 3));
    }, 7_000);
    return () => window.clearInterval(interval);
  }, [loading]);

  async function startDebate(nextQuestion?: string) {
    const value = (nextQuestion ?? question).trim();
    if (!value || loading) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setQuestion(value);
    setActiveQuestion(value);
    setView("debate");
    setResult(null);
    setError("");
    setLoading(true);
    setStage(1);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: value, rounds, depth }),
        signal: controller.signal,
      });
      const data = (await response.json()) as DebateResult & { error?: string };
      if (!response.ok) throw new Error(data.error || "토론을 완료하지 못했습니다.");
      setResult(data);
      setMode(data.mode);
      setStage(4);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        setError("토론을 중단했습니다.");
      } else {
        setError(caught instanceof Error ? caught.message : "토론을 완료하지 못했습니다.");
      }
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void startDebate();
  }

  function reset() {
    controllerRef.current?.abort();
    setView("intro");
    setQuestion("");
    setActiveQuestion("");
    setResult(null);
    setError("");
    setLoading(false);
    setStage(1);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyAnswer() {
    if (!result) return;
    const text = [
      result.final.thesis,
      "",
      result.final.summary,
      "",
      ...result.final.actions.map((action, index) => (index + 1) + ". " + action),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_800);
  }

  const quality = [24, 47, 73, 96][stage - 1];
  const statusLabel =
    mode === "live" ? "LIVE API" : mode === "demo" ? "DEMO · API KEY NEEDED" : "CHECKING API";
  const thinkingLabels = [
    "GPT가 문제를 구조화하고 초안을 작성하고 있어요",
    "Claude가 전제와 놓친 맥락을 교차 검증하고 있어요",
    "두 모델이 반론을 반영해 합의점을 찾고 있어요",
  ];

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <button className="brand brand-button" type="button" onClick={reset} aria-label="Roundtable AI 홈">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <span>ROUNDTABLE</span>
        </button>
        <div className="topbar-center" aria-label="시스템 상태">
          <span className={"live-dot " + (mode !== "live" ? "demo-dot" : "")} />
          <span>{mode === "live" ? "실제 모델 연결됨" : "데모 모드 · API 키를 연결하세요"}</span>
        </div>
        <div className="topbar-actions">
          <span className={"demo-badge " + (mode === "live" ? "live-badge" : "")}>{statusLabel}</span>
          <button className="icon-button" type="button" onClick={() => setLight((value) => !value)} aria-label="화면 밝기 전환">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42M7.06 16.94l-1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>
          </button>
        </div>
      </header>

      <div className="app-shell">
        <aside className={"sidebar " + (mobileOpen ? "open" : "")}>
          <button className="new-debate" type="button" onClick={reset}>
            <span>새 토론</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>

          <section className="side-section">
            <div className="section-label"><span>QUICK START</span><span>04</span></div>
            <div className="prompt-list">
              {prompts.map((item, index) => (
                <button className="prompt-chip" type="button" key={item.title} onClick={() => void startDebate(item.prompt)}>
                  <span className="prompt-num">0{index + 1}</span>
                  <span>{item.title}</span>
                  <ChevronIcon />
                </button>
              ))}
            </div>
          </section>

          <section className="side-section settings-section">
            <div className="section-label"><span>DEBATE SETTINGS</span></div>
            <div className="setting-block">
              <span className="setting-title">토론 라운드</span>
              <span className="segmented">
                {[2, 3, 4].map((value) => (
                  <button className={rounds === value ? "active" : ""} type="button" key={value} onClick={() => setRounds(value)}>
                    {value}
                  </button>
                ))}
              </span>
            </div>
            <label className="setting-block">
              <span className="setting-title">검토 강도</span>
              <span className="select-wrap">
                <select value={depth} onChange={(event) => setDepth(event.target.value)} aria-label="검토 강도">
                  <option value="balanced">균형 있게</option>
                  <option value="critical">비판적으로</option>
                  <option value="creative">창의적으로</option>
                </select>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg>
              </span>
            </label>
          </section>

          <div className="sidebar-foot">
            <div className="model-mini">
              <span className="mini-orb gpt-orb">G</span>
              <span><b>GPT</b><small>제안 · 구조화</small></span>
            </div>
            <span className="plus">+</span>
            <div className="model-mini">
              <span className="mini-orb claude-orb">C</span>
              <span><b>Claude</b><small>비판 · 맥락화</small></span>
            </div>
          </div>
        </aside>

        <main className="workspace">
          {view === "intro" ? (
            <section className="intro-panel">
              <div className="eyebrow"><span /> TWO MINDS, ONE BETTER ANSWER</div>
              <h1>첫 번째 답보다,<br /><em>더 나은 결론.</em></h1>
              <p className="intro-copy">
                GPT가 해답을 제안하고 Claude가 빈틈을 찾습니다.<br />
                서로의 논리를 검토한 뒤, 하나의 실행 가능한 답으로 합의합니다.
              </p>

              <form className="question-box" onSubmit={submit}>
                <label htmlFor="questionInput">무엇이든 물어보세요</label>
                <textarea
                  id="questionInput"
                  rows={2}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="예: 다음 커리어로 이직과 창업 중 무엇을 선택해야 할까?"
                  maxLength={2000}
                  required
                />
                <div className="question-actions">
                  <div className="input-meta">
                    <span className="model-stack" aria-hidden="true"><i className="gpt-orb">G</i><i className="claude-orb">C</i></span>
                    <span>{mode === "live" ? "두 실제 모델이 함께 답합니다" : "API 키 연결 전에는 데모로 답합니다"}</span>
                  </div>
                  <button className="start-button" type="submit"><span>토론 시작</span><ArrowIcon /></button>
                </div>
              </form>

              <div className="process-strip" aria-label="토론 과정">
                <div><span>01</span><p><b>초안</b>서로 다른 관점 제시</p></div><i />
                <div><span>02</span><p><b>교차 검증</b>근거와 허점 검토</p></div><i />
                <div><span>03</span><p><b>합의</b>최선의 답으로 통합</p></div>
              </div>
            </section>
          ) : (
            <section className="debate-panel">
              <div className="debate-head">
                <div>
                  <div className="eyebrow"><span /> {mode === "live" ? "LIVE ROUNDTABLE" : "DEMO ROUNDTABLE"}</div>
                  <h2>{activeQuestion}</h2>
                </div>
                <div className="debate-controls">
                  <span>{stage} / 4 stages</span>
                  {loading && (
                    <button className="pause-button" type="button" onClick={() => controllerRef.current?.abort()} aria-label="토론 중단">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="progress-track"><span style={{ width: quality + "%" }} /></div>
              <div className="debate-grid">
                <div className="conversation">
                  {loading && (
                    <div className="thinking">
                      <div className="thinking-orb"><i /></div>
                      <p>{thinkingLabels[Math.min(stage - 1, 2)]}</p>
                    </div>
                  )}

                  {error && (
                    <div className="error-panel" role="alert">
                      <b>토론을 완료하지 못했습니다.</b>
                      <p>{error}</p>
                      <button type="button" onClick={() => void startDebate(activeQuestion)}>다시 시도</button>
                    </div>
                  )}

                  {result?.messages.map((message, index) => (
                    <article className={"message " + message.role} key={message.role + "-" + index}>
                      <div className="message-avatar">{message.role === "gpt" ? "G" : "C"}</div>
                      <div>
                        <div className="message-meta">
                          <b>{message.label}</b>
                          <span className="message-tag">{message.tag}</span>
                          <span>{result.mode === "live" ? result.models[message.role === "gpt" ? "openai" : "anthropic"] : "데모 응답"}</span>
                        </div>
                        <div className="message-text"><p>{message.text}</p></div>
                      </div>
                    </article>
                  ))}

                  {result && (
                    <section className="final-answer">
                      <div className="final-top">
                        <div>
                          <span className="final-kicker">CONSENSUS · 최종 합의안</span>
                          <h3>{result.final.thesis}</h3>
                        </div>
                        <button className="copy-button" type="button" onClick={() => void copyAnswer()} aria-label="최종 답변 복사">
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h11v11H8zM5 16V5h11" /></svg>
                        </button>
                      </div>
                      <div className="final-body">
                        <p>{result.final.summary}</p>
                        <div className="action-plan">
                          {result.final.actions.map((action, index) => (
                            <div className="action-item" key={action}><span>0{index + 1}</span><b>{action}</b></div>
                          ))}
                        </div>
                        <div className="consensus-foot">
                          <div className="consensus-models">
                            <i className="gpt-orb">G</i><i className="claude-orb">C</i>
                            <span>{result.mode === "live" ? "실제 GPT × Claude 합의" : "API 키 연결 전 데모 합의"}</span>
                          </div>
                          <span>{rounds} rounds · {depth}</span>
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                <aside className="round-map">
                  <div className="section-label"><span>ROUNDTABLE MAP</span></div>
                  <ol>
                    {stages.map((item, index) => (
                      <li className={index + 1 === stage ? "active" : index + 1 < stage ? "done" : ""} key={item.title}>
                        <span>{index + 1}</span><div><b>{item.title}</b><small>{item.detail}</small></div>
                      </li>
                    ))}
                  </ol>
                  <div className="quality-meter">
                    <div><span>답변 완성도</span><b>{quality}%</b></div>
                    <div className="meter-track"><i style={{ width: quality + "%" }} /></div>
                    <p>{loading ? thinkingLabels[Math.min(stage - 1, 2)] : result ? "합의된 실행안을 완성했어요." : "다시 시도할 수 있어요."}</p>
                  </div>
                </aside>
              </div>
            </section>
          )}
        </main>
      </div>

      <div className={"toast " + (copied ? "show" : "")} role="status">답변을 복사했어요.</div>
      <button className="mobile-menu" type="button" onClick={() => setMobileOpen((value) => !value)} aria-label="메뉴 열기">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14M5 16h14" /></svg>
      </button>
    </>
  );
}
