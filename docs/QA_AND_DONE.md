# QA_AND_DONE.md — 완료 정의 (v2)

> 티켓이 언제 "완료"인지의 기준.
> v2: 회고는 티켓 안, 검증 루프 ×2. 풀팀 모드라 micro 없음.

## Definition of Done (v2)

티켓이 다음을 모두 만족하면 "완료(DONE)" 상태로 변경:

### 코드
- [ ] Plan의 모든 Task 완료
- [ ] AC의 모든 체크박스 완료
- [ ] 관련 REQ 기능 ID의 요구사항 충족 (해당 시)
- [ ] `pnpm type-check` 통과
- [ ] `pnpm lint` 통과

### 검증
- [ ] `/frontend-fundamentals:review` Critical 0개 (또는 사용자 예외 승인, 최대 1회 추가)
- [ ] code-reviewer 통과 (또는 사용자 예외 승인, 최대 1회 추가)
- [ ] (해당 시) 단위 테스트(Vitest) 통과
- [ ] (cross + UI) Playwright Acceptance 통과

### 수동
- [ ] 변경 화면 브라우저에서 동작 확인 (데스크탑 다크 모드)
- [ ] Edge case 확인 (Empty, Error, Loading)
- [ ] (UI) DESIGN_SYSTEM.md 컴포넌트 사양과 일치 (variant/size/token)

### 문서 (v2 — 별도 파일 없음)
- [ ] 티켓 파일의 `## 회고` 섹션 채워짐
- [ ] 변경된 폴더 README 업데이트
- [ ] (UI 신규 화면) `docs/screens/`에 화면 정의 누적

### Git
- [ ] 커밋 메시지 Conventional Commits 준수
- [ ] PR 생성 + **최소 1명 승인 후 머지** (풀팀, 본인 머지 금지)

### v1에서 폐기된 항목
- ~~docs/analysis/<TICKET>_report.md 작성~~ → 티켓 파일 회고 섹션
- ~~검증 6회 모두 통과~~ → 검증 2회 + 추가 1회까지

## 상태 단계

| 상태 | 의미 |
|------|------|
| `Implementation Done: YES` | 코드 작성 + 자동 검증 완료 |
| `Release Verified: PENDING` | 배포 검증 대기 |
| `Release Verified: YES` | 프로덕션 검증 완료 |
| `Ticket Done: YES` | 최종 승인 (PR 머지) |

## 회고 섹션 양식 (v2 — 티켓 안에 채움)

```markdown
## 회고
- 실제로 한 일: <3~5줄로 무엇을 만들었는지>
- 빗나간 점: <plan과 다르게 진행한 부분, 추가/제거한 것>
- 다음에 비슷한 거 할 때: <학습한 것 1~2줄>
```
