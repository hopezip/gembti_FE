# `src/components/game` — 게임 도메인 공용 컴포넌트

여러 기능(메인·추천·검색 등)에서 공유하는 **게임 도메인 표시 컴포넌트** 모음.
`ui/`(도메인 무지 primitive)와 달리 장르·평점 같은 게임 데이터를 props로 받는 합성 컴포넌트를 둔다.

## 규칙
- 색은 **semantic token만** 사용(primitive/hex 금지). 런타임 이미지 URL은 `style={{ backgroundImage }}` 인라인 허용(Panda 정적 추출 불가).
- 도메인 데이터 패칭/상태는 갖지 않는다 — props로만 받는다(표시 전용).
- 다크 모드 · 데스크탑 전용.

## 등재 컴포넌트

| 컴포넌트 | 파일 | props | 용도 |
|---|---|---|---|
| `GameSummaryCard` | `GameSummaryCard.tsx` | `genres`/`rating`/`thumbnailUrl?` | 게임 그리드 카드(테두리 없는 둥근 커버 + 장르·★평점). Figma 비회원 카드 기준. 메인 추천/인기 그리드에서 사용. |

> 참고: 검색 페이지(`features/game/GameSearchCard`)는 아직 자체 카드를 쓴다 — 추후 `GameSummaryCard`로 통합 예정(별도 티켓).
