# <화면명> — 화면 정의서

## 메타
- 화면 ID: SCREEN-NNN
- 생성: <YYYY-MM-DD>
- 관련 티켓: <티켓-ID> (예: LOGIN-FE-001)
- 관련 REQ: <REQ 기능 ID>

## 목적
이 화면은 무엇을 위한 것인가? (한 줄)

## 진입 경로
- URL: `/...`
- 진입 트리거: <어디서 어떻게>
- 접근 권한: Public / Public only / Auth

## UI 컴포넌트
- <컴포넌트 1>: <설명> (DESIGN_SYSTEM.md 참조)
- <컴포넌트 2>: <설명>

## 상태 분기 (Empty / Loading / Error / Success)

| 상태 | UI |
|------|----|
| Empty | <설명> |
| Loading | <설명> |
| Error | <설명> |
| Success | <설명> |

## API 사용
- `GET /api/...` — <목적>

## Acceptance Criteria
- [ ] <조건>
- [ ] <조건>

## 와이어 (간단히)

```
+------------------+
| Header           |
+------------------+
| <main content>   |
+------------------+
```

## 관련 문서
- 티켓: `../tickets/MS-NN/<티켓-ID>_<설명>.md`
- 디자인: `../../docs/design/DESIGN_SYSTEM.md`
