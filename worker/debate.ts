type RuntimeEnv = Cloudflare.Env & {
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_MODEL?: string;
  ANTHROPIC_MODEL?: string;
};

type DebateRequest = {
  question?: unknown;
  rounds?: unknown;
  depth?: unknown;
};

type DebateMessage = {
  role: "gpt" | "claude";
  label: "GPT" | "Claude";
  tag: string;
  text: string;
};

type FinalAnswer = {
  thesis: string;
  summary: string;
  actions: [string, string, string];
};

const DEFAULT_OPENAI_MODEL = "gpt-6.1-sol";
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5-5";

const sharedRules = [
  "사용자의 질문에 한국어로 답한다.",
  "상대 모델의 주장을 그대로 반복하지 말고, 구체적인 근거와 판단 기준을 추가한다.",
  "과장된 확신을 피하고, 중요한 가정이나 불확실성을 명시한다.",
  "의학·법률·재무 등 고위험 주제에서는 전문가 상담이 필요할 수 있음을 분명히 한다.",
  "답변은 간결하지만 실제로 행동할 수 있을 만큼 구체적으로 작성한다.",
].join("\n");

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function cleanQuestion(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 2_000);
}

function cleanRounds(value: unknown) {
  const parsed = Number(value);
  return parsed === 2 || parsed === 3 || parsed === 4 ? parsed : 3;
}

function cleanDepth(value: unknown) {
  if (value === "critical" || value === "creative") return value;
  return "balanced";
}

function depthInstruction(depth: string) {
  if (depth === "critical") {
    return "반례, 숨은 비용, 실패 조건을 우선적으로 찾아 비판적으로 검토한다.";
  }
  if (depth === "creative") {
    return "기존 선택지 밖의 대안과 새로운 조합을 적극적으로 제안한다.";
  }
  return "장점과 위험을 균형 있게 검토한다.";
}

function extractOpenAIText(payload: {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string; refusal?: string }> }>;
}) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const pieces =
    payload.output?.flatMap((item) =>
      (item.content ?? [])
        .filter((content) => content.type === "output_text" && content.text)
        .map((content) => content.text as string),
    ) ?? [];

  const text = pieces.join("\n").trim();
  if (!text) throw new Error("OpenAI가 텍스트 응답을 반환하지 않았습니다.");
  return text;
}

async function callOpenAI(
  env: RuntimeEnv,
  instructions: string,
  input: string,
  structured = false,
) {
  const body: Record<string, unknown> = {
    model: env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    instructions,
    input,
    max_output_tokens: structured ? 1_500 : 1_000,
    reasoning: { effort: "low" },
  };

  if (structured) {
    body.text = {
      format: {
        type: "json_schema",
        name: "roundtable_consensus",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            thesis: { type: "string" },
            summary: { type: "string" },
            actions: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
            },
          },
          required: ["thesis", "summary", "actions"],
        },
      },
      verbosity: "medium",
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.OPENAI_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("OpenAI request failed", response.status, await response.text());
    throw new Error("OpenAI API 호출에 실패했습니다. 키, 모델 접근 권한, 사용량 한도를 확인해 주세요.");
  }

  return extractOpenAIText(await response.json());
}

async function callClaude(env: RuntimeEnv, system: string, input: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.ANTHROPIC_API_KEY,
      "anthropic-version": "2026-10-21",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 1_200,
      system,
      messages: [{ role: "user", content: input }],
    }),
  });

  if (!response.ok) {
    console.error("Anthropic request failed", response.status, await response.text());
    throw new Error("Anthropic API 호출에 실패했습니다. 키, 모델 접근 권한, 사용량 한도를 확인해 주세요.");
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = (payload.content ?? [])
    .filter((item) => item.type === "text" && item.text)
    .map((item) => item.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Claude가 텍스트 응답을 반환하지 않았습니다.");
  return text;
}

function demoResult(question: string) {
  const focus = question.replace(/[?!.]/g, "").slice(0, 44);
  const messages: DebateMessage[] = [
    {
      role: "gpt",
      label: "GPT",
      tag: "데모 초안",
      text:
        "‘" +
        focus +
        "’에 답하려면 목표, 시간, 비용, 되돌릴 수 있는 정도를 분리해 같은 기준으로 비교하는 것이 좋습니다.",
    },
    {
      role: "claude",
      label: "Claude",
      tag: "데모 반론",
      text:
        "구조화된 비교만으로는 숫자로 표현하기 어려운 맥락을 놓칠 수 있습니다. 영향을 받는 사람과 실패 뒤 회복 가능성도 함께 살펴야 합니다.",
    },
    {
      role: "gpt",
      label: "GPT",
      tag: "데모 통합",
      text:
        "완벽한 예측보다 작은 검증이 유용합니다. 목표를 하나로 좁히고 실패 비용이 낮은 실험부터 실행한 뒤 실제 데이터로 결정을 업데이트하세요.",
    },
  ];

  return {
    mode: "demo" as const,
    messages,
    final: {
      thesis: "정답을 바로 고르기보다, 목표와 제약을 분리해 작은 실험으로 검증하세요.",
      summary:
        "현재는 API 키가 등록되지 않아 데모 응답을 보여주고 있습니다. 두 키를 등록하면 같은 흐름으로 실제 GPT와 Claude가 서로의 답을 검토합니다.",
      actions: ["성공 기준 1개 정의", "가장 큰 가정 1개 검증", "데이터로 다음 결정"],
    },
    models: {
      openai: "demo",
      anthropic: "demo",
    },
  };
}

async function runLiveDebate(
  env: RuntimeEnv,
  question: string,
  rounds: number,
  depth: string,
) {
  const messages: DebateMessage[] = [];
  const draft = await callOpenAI(
    env,
    [
      "당신은 Roundtable의 GPT 참가자다.",
      "사용자의 문제를 구조화하고 실행 가능한 첫 번째 해답을 제시한다.",
      sharedRules,
    ].join("\n"),
    "<사용자 질문>\n" + question + "\n</사용자 질문>",
  );
  messages.push({ role: "gpt", label: "GPT", tag: "초안 제시", text: draft });

  const critique = await callClaude(
    env,
    [
      "당신은 Roundtable의 Claude 참가자다.",
      "GPT의 초안을 검토해 타당한 부분은 인정하고, 놓친 맥락·반례·위험을 지적한다.",
      depthInstruction(depth),
      sharedRules,
    ].join("\n"),
    [
      "<사용자 질문>",
      question,
      "</사용자 질문>",
      "<GPT 초안>",
      draft,
      "</GPT 초안>",
    ].join("\n"),
  );
  messages.push({ role: "claude", label: "Claude", tag: "교차 검증", text: critique });

  let revised = draft;
  if (rounds >= 3) {
    revised = await callOpenAI(
      env,
      [
        "당신은 Roundtable의 GPT 참가자다.",
        "Claude의 비판을 방어적으로 반박하지 말고, 타당한 내용을 반영해 해답을 개선한다.",
        sharedRules,
      ].join("\n"),
      [
        "<사용자 질문>",
        question,
        "</사용자 질문>",
        "<이전 GPT 답변>",
        draft,
        "</이전 GPT 답변>",
        "<Claude 검토>",
        critique,
        "</Claude 검토>",
      ].join("\n"),
    );
    messages.push({ role: "gpt", label: "GPT", tag: "관점 통합", text: revised });
  }

  let finalCheck = "";
  if (rounds >= 4) {
    finalCheck = await callClaude(
      env,
      [
        "당신은 Roundtable의 최종 검증자다.",
        "수정된 답변에서 아직 남은 치명적인 허점과 적용 조건만 간결하게 확인한다.",
        depthInstruction(depth),
        sharedRules,
      ].join("\n"),
      [
        "<사용자 질문>",
        question,
        "</사용자 질문>",
        "<수정된 답변>",
        revised,
        "</수정된 답변>",
      ].join("\n"),
    );
    messages.push({ role: "claude", label: "Claude", tag: "최종 검증", text: finalCheck });
  }

  const transcript = messages
    .map((message) => message.label + " (" + message.tag + "):\n" + message.text)
    .join("\n\n");
  const structured = await callOpenAI(
    env,
    [
      "당신은 Roundtable의 중립적인 편집자다.",
      "토론에서 합의된 최선의 답을 정리한다.",
      "thesis는 핵심 결론 한 문장, summary는 근거와 조건을 담은 짧은 단락, actions는 지금 실행할 수 있는 정확히 3개의 짧은 행동이다.",
      "JSON 스키마를 정확히 따른다.",
      sharedRules,
    ].join("\n"),
    [
      "<사용자 질문>",
      question,
      "</사용자 질문>",
      "<토론 기록>",
      transcript,
      "</토론 기록>",
    ].join("\n"),
    true,
  );

  const final = JSON.parse(structured) as FinalAnswer;
  if (!Array.isArray(final.actions) || final.actions.length !== 3) {
    throw new Error("최종 합의안의 형식이 올바르지 않습니다.");
  }

  return {
    mode: "live" as const,
    messages,
    final,
    models: {
      openai: env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      anthropic: env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
    },
  };
}

export async function handleRoundtableApi(request: Request, env: RuntimeEnv) {
  const url = new URL(request.url);

  if (url.pathname === "/api/status" && request.method === "GET") {
    const openai = Boolean(env.OPENAI_API_KEY);
    const anthropic = Boolean(env.ANTHROPIC_API_KEY);
    return json({
      mode: openai && anthropic ? "live" : "demo",
      configured: { openai, anthropic },
      models: {
        openai: env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
        anthropic: env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
      },
    });
  }

  if (url.pathname !== "/api/debate") return null;
  if (request.method !== "POST") return json({ error: "허용되지 않은 요청입니다." }, 405);

  let body: DebateRequest;
  try {
    body = (await request.json()) as DebateRequest;
  } catch {
    return json({ error: "요청 형식이 올바르지 않습니다." }, 400);
  }

  const question = cleanQuestion(body.question);
  if (!question) return json({ error: "질문을 입력해 주세요." }, 400);

  const rounds = cleanRounds(body.rounds);
  const depth = cleanDepth(body.depth);
  if (!env.OPENAI_API_KEY || !env.ANTHROPIC_API_KEY) {
    return json(demoResult(question));
  }

  try {
    return json(await runLiveDebate(env, question, rounds, depth));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "토론을 완료하지 못했습니다.";
    return json({ error: message, code: "PROVIDER_ERROR" }, 502);
  }
}
