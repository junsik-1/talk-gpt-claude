# talk-gpt-claude

GPT와 Claude가 서로의 답을 검토하고, 하나의 더 나은 결론을 도출하는 과정을 보여주는 인터랙티브 웹페이지입니다.

## 현재 진행상황

**v0.1 — 인터랙티브 UI 프로토타입 완성**

| 항목 | 상태 |
| --- | --- |
| 질문 입력 및 토론 시작 | ✅ 완료 |
| GPT 초안 → Claude 반론 → 관점 통합 | ✅ 완료 |
| 최종 합의안 및 실행 단계 생성 | ✅ 완료 |
| 토론 라운드·검토 강도 설정 | ✅ 완료 |
| 일시정지·결과 복사 | ✅ 완료 |
| 다크·라이트 모드 | ✅ 완료 |
| 모바일 반응형 화면 | ✅ 완료 |
| 실제 GPT API 연동 | ⏳ 예정 |
| 실제 Claude API 연동 | ⏳ 예정 |
| 대화 기록 저장 | ⏳ 예정 |

> 현재 버전은 API 키 없이 토론 경험을 확인할 수 있는 프론트엔드 데모입니다. 화면에 표시되는 GPT·Claude 답변은 미리 설계된 데모 응답이며 실제 모델 호출 결과가 아닙니다.

## 배포

- 비공개 데모: [Roundtable AI](https://roundtable-ai-junsu-1106.cloudy-curry-0557.chatgpt.site)
- GitHub: [junsik-1/talk-gpt-claude](https://github.com/junsik-1/talk-gpt-claude)

## 주요 기능

- 질문을 입력하면 두 AI의 토론 과정을 단계별로 시각화
- GPT는 초안과 구조화를, Claude는 반론과 맥락 검토를 담당
- 토론 결과를 핵심 결론과 3단계 실행안으로 정리
- 사이드 프로젝트, 커리어, 여행, 팀 운영 예시 질문 제공
- 사용자 질문에 대응하는 범용 데모 답변 생성
- 토론 진행률과 답변 완성도 표시
- 데스크톱·태블릿·모바일 레이아웃 지원

## 기술 구성

- HTML
- CSS
- Vanilla JavaScript
- 별도 빌드 과정 없는 정적 사이트

## 로컬 실행

```bash
python3 -m http.server 4173 --directory dist
```

브라우저에서 `http://localhost:4173`을 열면 됩니다.

## 프로젝트 구조

```text
.
├── .openai/
│   └── hosting.json
├── dist/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## 다음 단계

1. 서버에서 OpenAI·Anthropic API 키를 안전하게 관리
2. GPT와 Claude의 응답을 스트리밍 방식으로 연결
3. 각 모델이 이전 상대 답변을 검토하도록 토론 오케스트레이션 구현
4. 토론 종료 조건과 최종 합의 프롬프트 고도화
5. 대화 기록 저장 및 다시 보기 기능 추가
6. 응답 품질·비용·소요 시간 비교 화면 추가

## 업데이트 원칙

기능이 추가되거나 배포 상태가 변경될 때 이 README의 진행상황, 제한사항, 다음 단계를 함께 갱신합니다.
