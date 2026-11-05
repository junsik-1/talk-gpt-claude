# talk-gpt-claude

GPT와 Claude가 서로의 답을 검토하고, 하나의 더 나은 결론을 도출하는 과정을 보여주는 인터랙티브 웹페이지입니다.

## 현재 진행상황

**v0.2 — 실제 API 오케스트레이션 구현 완료, 운영 키 등록 대기**

| 항목 | 상태 |
| --- | --- |
| 질문 입력 및 토론 시작 | ✅ 완료 |
| GPT 초안 → Claude 반론 → 관점 통합 | ✅ 완료 |
| 최종 합의안 및 실행 단계 생성 | ✅ 완료 |
| 토론 라운드·검토 강도 설정 | ✅ 완료 |
| 일시정지·결과 복사 | ✅ 완료 |
| 다크·라이트 모드 | ✅ 완료 |
| 모바일 반응형 화면 | ✅ 완료 |
| OpenAI Responses API 연동 코드 | ✅ 완료 |
| Anthropic Messages API 연동 코드 | ✅ 완료 |
| 모델 간 다중 라운드 오케스트레이션 | ✅ 완료 |
| API 키의 서버 비밀변수 관리 | ✅ 구조 완료 · 키 등록 필요 |
| 대화 기록 저장 | ⏳ 예정 |

> API 키가 모두 등록되면 LIVE API 모드로 실제 GPT와 Claude를 호출합니다. 키가 하나라도 없으면 서비스가 중단되지 않고 명확히 표시된 DEMO 모드로 자동 전환됩니다.

## 배포

- 비공개 데모: [Roundtable AI](https://roundtable-ai-junsu-1106.cloudy-curry-0557.chatgpt.site)
- GitHub: [junsik-1/talk-gpt-claude](https://github.com/junsik-1/talk-gpt-claude)

## 주요 기능

- 질문을 입력하면 두 AI의 토론 과정을 단계별로 시각화
- GPT는 초안과 구조화를, Claude는 반론과 맥락 검토를 담당
- GPT 초안 → Claude 교차 검증 → GPT 수정 → Claude 최종 검증 → GPT 합의안 순서로 서버에서 호출
- 토론 라운드 수에 따라 실제 모델 호출 단계를 조절
- 토론 결과를 핵심 결론과 3단계 실행안으로 정리
- 사이드 프로젝트, 커리어, 여행, 팀 운영 예시 질문 제공
- OpenAI Structured Outputs로 최종 합의안 형식을 검증
- API 키가 없을 때 범용 데모 답변으로 안전하게 폴백
- 토론 진행률과 답변 완성도 표시
- 데스크톱·태블릿·모바일 레이아웃 지원

## 기술 구성

- Next.js 16 + React 19
- Vinext + Cloudflare Workers
- TypeScript + CSS
- OpenAI Responses API
- Anthropic Messages API
- 기본 모델: `gpt-6.1-sol`, `claude-sonnet-5-5`

## 로컬 실행

```bash
npm install
npm run dev
```

실제 API를 로컬에서 시험하려면 `.env.example`의 변수 이름을 참고해 로컬 비밀변수를 설정합니다. 실제 키는 Git에 커밋하지 않습니다.

## 프로젝트 구조

```text
.
├── .openai/
│   └── hosting.json
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── roundtable-client.tsx
├── worker/
│   ├── debate.ts
│   └── index.ts
├── .env.example
├── package.json
└── README.md
```

## 다음 단계

1. 운영 사이트에 `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` 등록
2. 실제 계정으로 두 API의 통합 호출 검증
3. GPT와 Claude의 응답을 스트리밍 방식으로 전달
4. 토론 종료 조건과 최종 합의 프롬프트 고도화
5. 대화 기록 저장 및 다시 보기 기능 추가
6. 응답 품질·비용·소요 시간 비교 화면 추가

## 업데이트 원칙

기능이 추가되거나 배포 상태가 변경될 때 이 README의 진행상황, 제한사항, 다음 단계를 함께 갱신합니다.
