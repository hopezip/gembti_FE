# <TICKET-ID>: <한 줄 제목>

## 메타
- ID: <TICKET-ID> (REQ 기능 ID 우선, 예: LOGIN-FE-001)
- 타입: FEAT | BUG | REFACTOR | TASK | CHORE
- 생성: <YYYY-MM-DD>
- 상태: TODO | IN_PROGRESS | DONE
- 마일스톤: MS-NN
- 브랜치: <자동, git-branching 스킬이 채움>
- 분기 판별: normal | cross  (풀팀 모드라 micro 없음)

---

## 인라인 룰 (이 작업에서 지킬 것만)

<해당 도메인 룰을 4~6줄로 요약. 예:>
- httpOnly Cookie만 사용 (localStorage 금지)
- Zod 스키마 → src/lib/schemas/ 에
- Park UI 베이스 + panda recipe, semantic token만
- API 호출은 src/services/ 또는 src/lib/api/ 함수로

---

## Spec (왜) — 3~5줄

<무엇을 왜 만드는지. 관련 REQ 기능 ID 명시>

---

## Plan (어떻게) — Task 단위

- Task 1: <설명>
- Task 2: <설명>
- ...

---

## AC (Acceptance Criteria)

- [ ] <조건 1>
- [ ] <조건 2>
- ...

---

## 영향 파일 (예상)

- <경로 1> (신규/수정)
- <경로 2>
- ...

---

## Must read docs (인라인 룰로 부족할 때만)

- `../architecture/<해당 도메인>.md`
- (UI) `../../docs/design/DESIGN_SYSTEM.md`

---

## Related screens (있다면)

- `../screens/<화면명>.md`

---

## API endpoints used

- `GET /api/...`
- `POST /api/...`

---

## Verification (자동 검증)

### 정적
- [ ] `pnpm type-check` 통과
- [ ] `pnpm lint` 통과

### 원칙 (normal/cross)
- [ ] `/frontend-fundamentals:review` Critical 0개
- [ ] code-reviewer 에이전트 통과

### 기능 (해당 시)
- [ ] `pnpm test` 통과
- [ ] (cross + UI) Playwright Acceptance Criteria 통과

### 수동
- [ ] 변경 화면 브라우저에서 동작 확인 (데스크탑 다크 모드)
- [ ] Edge case (Empty/Loading/Error) 확인

### 문서 (v2)
- [ ] 이 파일의 `## 회고` 섹션 채움
- [ ] 변경된 폴더 README 업데이트

---

## 회고 (구현 후 ticket-implementer가 채움)

<빈 상태로 두기>

- 실제로 한 일:
- 빗나간 점:
- 다음에 비슷한 거 할 때:
