# GAMBITI · Design System

> 와이어프레임(`pages/*.html`, `_detail-base.css`, `_write-base.css`) 18개 페이지에서 추출한 디자인 토큰과 컴포넌트 사양서.
> **React + Panda CSS + Park UI** 스택, **다크 모드 전용**, **데스크탑 우선**.
>
> 이 문서는 Claude Code가 그대로 읽어 구현에 적용할 수 있도록 작성되었습니다.

---

## 0. 빠른 시작 (Claude Code 지침)

1. **모든 색은 semantic token만 사용한다.** `gray.900` 같은 primitive는 토큰 정의 내부에서만 참조한다.
2. **컴포넌트는 Park UI를 베이스로 쓰고**, GAMBITI 토큰/recipe로 스타일을 덮어쓴다(`panda.config.ts` 의 `recipes`).
3. **버튼/인풋의 사이즈와 variant는 단 하나로 통일**한다. 와이어프레임에 잔존하는 변형은 모두 이 문서 기준으로 흡수한다.
4. **MVP는 데스크탑 다크 모드**. 반응형 모바일은 본 문서 밖. 라이트 모드 토큰은 추후 `semanticTokens.colors.bg._light` 형태로 확장한다.
5. 아이콘은 **Park UI 기본 아이콘셋(Lucide)** 사용. 임의 SVG 금지.
6. 모든 측정값은 4px 그리드(`spacing.1 = 4px`)에 정렬한다.

---

## 1. 파운데이션 토큰

### 1.1 컬러

#### 1.1.1 Primitive — 원자 컬러 스케일

| 토큰 | HEX | 용도 |
|---|---|---|
| `gray.50`  | `#f2f2f2` | 본문 텍스트 기본 |
| `gray.100` | `#d8d8da` |  |
| `gray.200` | `#b8b8b8` | 보조 텍스트 |
| `gray.300` | `#9e9ea4` |  |
| `gray.400` | `#7a7a82` | 약한 텍스트 / 플레이스홀더 |
| `gray.500` | `#5c5c64` |  |
| `gray.600` | `#45454c` |  |
| `gray.700` | `#35353c` | 강조 보더 |
| `gray.800` | `#2a2a2f` | 기본 보더 |
| `gray.850` | `#222226` | 위 단계 surface |
| `gray.900` | `#1a1a1d` | **기본 surface** |
| `gray.925` | `#141416` | subtle bg |
| `gray.950` | `#0c0c0d` | **캔버스(최하층)** |

| 토큰 | HEX | 용도 |
|---|---|---|
| `orange.400` | `#ff7a4d` | hover / glow 보조 |
| `orange.500` | `#ef5a2c` | **⭐ 브랜드 액센트** |
| `orange.600` | `#d04318` | active |

| 토큰 | HEX | 용도 |
|---|---|---|
| `success.400` | `#7bd389` | 파티/완료/OP 태그 |
| `warning.400` | `#f7d774` | 노트/스포일러/공지 |
| `danger.400`  | `#ff7a7a` | 삭제/오류 |
| `info.400`    | `#7aa7d8` | 공략/안내 |

(전체 스케일은 `panda.config.ts` 참조)

#### 1.1.2 Semantic — 의미 토큰 (실제 사용 토큰)

| 토큰 | 매핑 | 용도 |
|---|---|---|
| `bg.canvas`         | `gray.950` | 페이지 최하층 |
| `bg.subtle`         | `gray.925` | 살짝 올라온 영역, 댓글 카드 |
| `bg.surface`        | `gray.900` | **카드/패널 기본** |
| `bg.surfaceRaised`  | `gray.850` | 카드 위의 카드 / 호버 상승 |
| `bg.overlay`        | `rgba(0,0,0,.65)` | 모달 백드롭 |
| `fg.default`        | `gray.50`  | **본문 텍스트** |
| `fg.muted`          | `gray.200` | 보조 텍스트 |
| `fg.subtle`         | `gray.400` | 캡션/메타 |
| `fg.placeholder`    | `gray.400` | 입력 플레이스홀더 |
| `fg.onAccent`       | `#ffffff`  | primary 버튼 위 텍스트 |
| `fg.link`           | `orange.500` | 본문 내 링크 |
| `border.default`    | `gray.800` | **카드/입력 기본 보더** |
| `border.emphasized` | `gray.700` | hover 시 보더 / 강조 분리 |
| `border.accent`     | `orange.500` | focus / 활성 |
| `border.danger`     | `danger.400` | 오류 상태 |
| `accent.default`    | `orange.500` | primary 배경 |
| `accent.hover`      | `orange.400` |  |
| `accent.active`     | `orange.600` |  |
| `accent.soft`       | `rgba(239,90,44,.14)` | tag/chip 활성 배경 |
| `accent.fg`         | `orange.500` | soft 위의 텍스트 |
| `success.{default,soft,fg}` | — | 파티/성공 |
| `warning.{default,soft,fg}` | — | 노트/주의 |
| `danger.{default,soft,fg}`  | — | 삭제/오류 |
| `info.{default,soft,fg}`    | — | 공략/안내 |

#### 1.1.3 도메인 컬러 매핑 (게시글 타입 ↔ 컬러)

| 게시글 타입 | 컬러 토큰 | 사용처 |
|---|---|---|
| **리뷰**(review) | `accent` | TypeTag, 별점, 강조 액션 |
| **파티**(party)  | `success` | TypeTag, 파티 모집 카드 보더, 마감 카운트다운 |
| **공략**(guide)  | `info` | TypeTag, 공략 글 마커 |
| **공지**(notice) | `warning` | TypeTag, 점검/이벤트 알림 |

→ 새 게시글 타입을 추가한다면 위 4종 외 컬러를 만들지 말고 `accent`/`success`/`info`/`warning` 안에서 선택.

---

### 1.2 타이포그래피

#### 1.2.1 폰트 패밀리

| 토큰 | 값 | 사용처 |
|---|---|---|
| `sans`    | `'Noto Sans KR', system-ui, …` | **모든 UI 텍스트** |
| `mono`    | `'JetBrains Mono', ui-monospace, …` | 캡션, 메타, 코드, 카운트, 키캡 |
| `display` | `'Archivo Black'` | **로고 전용** (다른 곳 사용 금지) |

> Google Fonts import (head에 1회만):
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Archivo+Black&display=swap" rel="stylesheet">
> ```

#### 1.2.2 폰트 사이즈

| 토큰 | px | 용도 |
|---|---|---|
| `2xs`  | 10 | 모노 캡션 small |
| `xs`   | 11 | 모노 캡션 / 태그 |
| `sm`   | 12 | 메타 / 미세 라벨 |
| `md`   | 13 | UI 텍스트 small |
| `lg`   | 14 | **본문 기본** |
| `xl`   | 16 | 본문 강조 / 큰 입력 |
| `2xl`  | 18 | h4 |
| `3xl`  | 20 | h3 |
| `4xl`  | 22 | h3 large |
| `5xl`  | 24 | 모달 타이틀 |
| `6xl`  | 30 | **페이지 타이틀** |
| `7xl`  | 36 | 큰 헤딩 |
| `8xl`  | 48 | display |
| `display` | 54 | 히어로 키 비주얼 타이틀 |

#### 1.2.3 텍스트 스타일 프리셋 (`textStyles`)

| 프리셋 | 정의 | 사용처 |
|---|---|---|
| `display.lg` | 54 / 1.2 / 800 / -1.2px | 히어로 |
| `heading.h1` | 30 / 1.2 / 800 / -0.5px | 페이지 타이틀 |
| `heading.h2` | 22 / 1.35 / 700 / -0.3px | 섹션 타이틀 |
| `heading.h3` | 20 / 1.35 / 700 | 카드 그룹 헤더 |
| `heading.h4` | 18 / 1.35 / 700 | 사이드카드 헤더 |
| `body.lg`    | 16 / 1.55 / 400 | 본문 강조 |
| `body.md`    | 14 / 1.55 / 400 | **기본 본문** |
| `body.sm`    | 13 / 1.55 / 400 | 보조 본문 |
| `body.read`  | 16 / 1.85 / 400 | **게시글 본문**(line-height 길게) |
| `caption`    | mono 11 / wider / uppercase | 메타·캡션 전반 |
| `code`       | mono 13 | 인라인 코드 |

#### 1.2.4 사용 규칙

- 본문은 `body.md` (14px) 기본. **글 본문(`pd-body`)만 예외적으로 `body.read` (16/1.85)**.
- 메타데이터·날짜·카운트·URL·키캡은 **반드시 mono** + `fg.subtle`.
- `display` 폰트는 로고에만. 헤딩에 쓰지 않는다.
- 헤딩에 `letterSpacing` 음수 적용은 30px 이상에만(가독성).

---

### 1.3 스페이싱 (4px 그리드)

| 토큰 | px |   | 토큰 | px |
|---|---|---|---|---|
| `0`   | 0  |   | `7`  | 28 |
| `0.5` | 2  |   | `8`  | 32 |
| `1`   | 4  |   | `9`  | 36 |
| `1.5` | 6  |   | `10` | 40 |
| `2`   | 8  |   | `11` | 44 |
| `2.5` | 10 |   | `12` | 48 |
| `3`   | 12 |   | `14` | 56 |
| `3.5` | 14 |   | `16` | 64 |
| `4`   | 16 |   | `20` | 80 |
| `5`   | 20 |   | `24` | 96 |
| `6`   | 24 |   | `32` | 128 |

**관용 패턴**
- 페이지 좌우 패딩: `7` (28px) 또는 `8` (32px)
- 카드 내부 패딩: `4` (16px) ~ `6` (24px)
- 섹션 간 수직 간격: `8` (32px) ~ `12` (48px)
- 라벨↔입력 간격: `2` (8px)
- 인풋 사이 간격(폼): `5` (20px) ~ `6` (24px)
- flex/grid `gap`은 인라인 마진 금지 — **`gap`을 우선 사용**

---

### 1.4 라운드 (`radii`)

| 토큰 | px | 사용처 |
|---|---|---|
| `xs`   | 3   | 작은 사각 태그, 키캡, 새 뱃지 |
| `sm`   | 4   | 작은 카드 / 칩 inner |
| `md`   | 6   | **버튼, 셀렉트 inner** |
| `lg`   | 8   | **입력 필드, 작은 카드** |
| `xl`   | 10  | 카드, 패널, 가이드 카드 |
| `2xl`  | 12  | 프레임, 모달 |
| `3xl`  | 14  | 큰 모달, 로고 카드 |
| `full` | ∞   | 알약(태그/칩), 원(아바타) |

---

### 1.5 섀도우 (`shadows`)

| 토큰 | 값 | 사용처 |
|---|---|---|
| `xs` | `0 1px 2px rgba(0,0,0,.4)` | 최소 elevation |
| `sm` | `0 2px 8px rgba(0,0,0,.4)` | hover lift |
| `md` | `0 8px 24px -6px rgba(0,0,0,.55)` | popover, dropdown |
| `lg` | `0 14px 40px -10px rgba(0,0,0,.7)` | **toast, hover card** |
| `xl` | `0 30px 80px -10px rgba(0,0,0,.7)` | **modal** |
| `frame` | `0 30px 80px -30px rgba(0,0,0,.6)` | 와이어프레임 프레임 |
| `glow`  | `0 10px 30px -8px rgba(239,90,44,.6) + 0 4px 12px rgba(0,0,0,.4)` | **chatbot FAB, primary glow** |
| `focusRing` | `0 0 0 3px rgba(239,90,44,.32)` | 모든 focus 상태 |

---

### 1.6 모션

| 토큰 | 값 | 사용처 |
|---|---|---|
| `durations.fast`   | 120ms | 색 전환, hover |
| `durations.base`   | 150ms | **기본 (대부분의 트랜지션)** |
| `durations.slow`   | 200ms | 카드 hover lift, expand |
| `durations.slower` | 300ms | 모달/토스트 enter |
| `easings.standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | **기본** |
| `easings.decel`    | `cubic-bezier(0, 0, 0.2, 1)` | enter |
| `easings.accel`    | `cubic-bezier(0.4, 0, 1, 1)` | exit |

**커스텀 키프레임**
```css
@keyframes pulse  { 0%,100% { opacity: .4 } 50% { opacity: 1 } }   /* draft 인디케이터 */
@keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px) } to { opacity: 1; transform: translate(-50%, 0) } }
@keyframes modalIn { from { opacity: 0 } to { opacity: 1 } }
```

---

### 1.7 z-index

| 토큰 | 값 | 사용처 |
|---|---|---|
| `base`     | 0    |  |
| `raised`   | 5    | 본문 위로 살짝 떠 있는 sticky bar |
| `sticky`   | 10   | sticky sidebar |
| `dropdown` | 25   | menu, popover, author card |
| `tooltip`  | 50   |  |
| `header`   | 60   | 페이지 헤더 / toolbar |
| `modal`    | 300  | dialog backdrop + content |
| `toast`    | 400  | toast(모달 위) |

---

## 2. Primitives (Park UI 매핑)

> 모든 Primitive는 [Park UI](https://park-ui.com/) 컴포넌트를 베이스로 한다. 우리는 토큰과 recipe만 덮어쓴다.

### 2.1 Button

**Anatomy**: `[icon?] [label] [icon?]`

**Variants** (5종 — 페이지 곳곳의 변형은 모두 이 5개로 흡수)

| variant | 용도 | 예시 |
|---|---|---|
| `primary` | 화면당 **1개만**. 핵심 행동. | "게시", "저장", "구매" |
| `secondary` | 보조 행동 | "취소", "임시저장" |
| `ghost` | 3차 행동 / 보더 약함 | 메뉴 안의 아이템, 텍스트 버튼 |
| `danger` | 위험 행동(외곽선) | "삭제 보기", 메뉴 안 삭제 |
| `dangerSolid` | 삭제 confirm 모달 메인 액션 | "영구 삭제" |

**Sizes**

| size | height | padding | font |
|---|---|---|---|
| `sm` | 32 | 12 / 6  | sm (12) |
| `md` ⭐ | 40 | 16 / 10 | md (13) |
| `lg` | 48 | 24 / 14 | lg (14) |

**상태**
- `default → hover → active → focus(focusRing) → disabled` 전부 토큰화
- disabled: `bg.surfaceRaised` + `fg.subtle`, fontWeight medium

**사용 규칙**
- **primary는 페이지당 1개**. 카드 안에서도 1개. CTA 충돌 금지.
- 텍스트만 있는 액션(예: "더보기", "전체보기")은 버튼이 아닌 **링크 스타일**(`fg.subtle`, hover 시 `fg.muted`).
- 아이콘 단독 → `IconButton`(아래) 사용. `Button` + 아이콘만 넣지 말 것.

---

### 2.2 IconButton

- 정사각형, `radii.md`, 사이즈는 Button과 동일(32/40/48)
- 보더만 있는 ghost 형태 기본. `aria-label` 필수.

---

### 2.3 Input / Textarea / Select

**Anatomy**: `[leftIcon?] [input] [rightIcon? | clear?]`

**Sizes**

| size | height | font |
|---|---|---|
| `sm` | 36 | md (13) |
| `md` ⭐ | 40 | lg (14) |
| `lg` | 48 | xl (16, medium) — 검색 hero, 큰 폼 진입 |

**상태**
- `default`: `bg.surface`, `border.default`, radius `lg`(8)
- `focus`: `border.accent` + `shadow.focusRing`
- `aria-invalid="true"`: `border.danger` + 빨간 글로우
- `disabled`: opacity 0.5

**Textarea**
- min-height 120, `resize: vertical`, line-height `1.6`

**Select**
- 디자인은 Input과 동일 + 우측 chevron(mono "▾", `fg.subtle`)
- Park UI `<Select.*>` 사용 권장

---

### 2.4 Checkbox · Radio · Switch · Segmented Control

- **Checkbox**: 16×16 사각, `radii.xs`, 체크 시 `accent.default` 배경 + 흰 체크
- **Radio**: 16×16 원, 체크 시 `accent.default` 링 + 8×8 inner dot
- **Switch**: 38×22, `bg.surfaceRaised` (off) → `accent.default` (on), 16×16 흰 thumb
- **Segmented Control** (= radio-seg): inline 그룹, 4px padding inner, active 시 `accent` 배경 + 흰 텍스트

---

### 2.5 Tag (읽기 전용) vs Chip (선택형)

#### Tag — 읽기 전용 라벨

- 형태: pill(`radii.full`), 1px 보더, mono 11px, uppercase
- Tones: `neutral` / `review` / `party` / `guide` / `notice` (도메인 컬러 매핑 참조)
- 사용처: 게시글 타입, 사용자 뱃지, 메타 라벨

#### Chip — 토글 가능

- 형태: pill, `bg.transparent` → 선택 시 `accent.soft` + `accent.fg` 텍스트 + `accent.default` 보더 + ✓ 프리픽스
- 사용처: 장르 필터, 성향 선택, 실력 선택, 활성 필터 표시

> 두 클래스를 혼동해서 쓰면 안 됨. **선택 가능한 것은 모두 Chip, 정보 표시는 모두 Tag.**

---

### 2.6 Avatar

| 사이즈 | px | 사용처 |
|---|---|---|
| `xs` | 24 | 리플라이 댓글 |
| `sm` | 28 | 댓글 본문 |
| `md` ⭐ | 32 | 대부분의 일반 위치 |
| `lg` | 36 | 헤더(34도 lg에 흡수), 카드 |
| `xl` | 48 | hover card, 프로필 |

- 형태: 원(`radii.full`), `bg.surfaceRaised`, `border.default` 1px
- 이니셜은 mono 12 ~ 14, `fg.default`
- OP 표시(글쓴이): `border.accent` + `fg.accent`

---

### 2.7 Card

**Variants**

| variant | 설명 |
|---|---|
| `default` | `bg.surface` + `border.default` + `radii.xl`(10) |
| `accent`  | 좌측 3px accent 보더 + accent 그라데이션 배경. **가이드 카드/Why 카드** |
| `interactive=true` | hover 시 `border.emphasized` + `translateY(-2px)` |

**Padding**: `sm`(16) / `md`(20) ⭐ / `lg`(24)

---

### 2.8 Dialog (Modal)

- backdrop: `bg.overlay` + `backdrop-filter: blur(4px)`
- container: `bg.surface`, `border.default`, `radii.3xl`(14), max-width `420px`, padding `8`(32px), text-align center
- 큰 원형 아이콘(64×64) → 제목(20/700) → 설명(13.5/`fg.muted`) → 액션 버튼(flex, 균등)
- 위험 confirm: 헤더 아이콘 `danger.soft` + 빨간 글, 노란 경고 박스로 "남는 데이터" 안내, 메인 액션 `dangerSolid`
- `Esc` 닫기, focus trap, scroll lock 필수 (Park UI Dialog가 기본 제공)

---

### 2.9 Toast

- 위치: `bottom-center`, `bottom: 36px`
- 카드: `bg.surface`, **좌측 3px 컬러 보더**(성공=`success`, 오류=`danger`, 정보=`info`)
- 구조: 원형 아이콘(28) + 제목(13.5/600) + 메타(11.5/mono) + 닫기 X
- 그림자: `shadows.lg`
- 진입: `toastIn` 0.25s, 자동 dismiss 3.5s

---

### 2.10 Tooltip

- mono 11, `bg.surfaceRaised`, `radii.sm`, padding `1.5 / 2`, `shadows.md`
- Park UI Tooltip 사용

---

### 2.11 Menu (Dropdown)

- container: `bg.canvas`, `border.emphasized`, `radii.lg`, `shadows.lg`, padding `1`
- item: padding `2 / 3`, `radii.sm`, hover `bg.surface`
- danger item: `danger.fg`, hover `danger.soft`
- 구분선: `border.default` 1px

---

### 2.12 Tabs / Segmented Tabs

두 종류 사용:

1. **언더라인 탭** (페이지 내 컨텐츠 전환): 활성 시 `accent` 색 + 2px 하단 보더. e.g. 글쓰기 타입 선택
2. **버튼 탭** (필터·정렬 전환): 보더 박스, 활성 시 `accent.soft` 배경 + `accent.fg` 텍스트. e.g. 댓글 정렬, 결과 정렬

---

### 2.13 Breadcrumb

- mono 11.5, `fg.subtle`, 구분자 ` / ` 또는 ` › `
- 현재 페이지(`.now`): `fg.default` + 600
- 우측에 작업 아이콘(공유/북마크) 정렬

---

### 2.14 Pagination

- 가운데 정렬, 숫자 박스(40×40, `radii.md`)
- 현재: `accent` 배경, 호버: `bg.surface`
- ← / → 화살표는 IconButton

---

### 2.15 Field (Form Wrapper)

```
[Label *  (hint right)]   ← label row, 라벨 13/600, 필수 표시는 accent
[ Input / Textarea ]
[ field-help: mono 11.5 fg.subtle ]
[ field-error: mono 12 danger.default (오류 시만) ]
```

- 필드 간 수직 간격: `5` (20px)
- `aria-required="true"`, `aria-invalid`, `aria-describedby=helpId` 표준 사용

---

## 3. Patterns (도메인 컴포넌트)

> Primitive를 조합한 GAMBITI 전용 컴포넌트. Park UI 베이스가 없으므로 직접 만든다.

### 3.1 GameCard

게임 표지 카드. 홈·검색·관련게임에 동일하게 등장.

```
┌──────────────────────────────┐
│  [thumb 16:10]              │  ← border-radius lg(8), 우측 상단에 매칭 뱃지(균형형만)
│  [NEW]            [94% MATCH]│     좌측 상단에 NEW 뱃지(신규)
│                              │
└──────────────────────────────┘
  Game Title (16/600)
  Genre · Year (12.5 fg.subtle)        Rating ★4.8 (accent)
  ─ (균형형만) "추천 이유 한 줄" — 2px accent 좌측 보더
  ─ (균형형만) match-bar 4px 그라데이션 게이지
```

**Variants**
- `conservative`: 썸네일 + 타이틀 + 메타만
- `balanced`: + 매칭% 뱃지 + 추천 이유 라인 + match-bar
- `list` (검색 페이지 리스트뷰): 가로 180px 썸네일 + 우측 텍스트 영역 + CTA 컬럼

**상태**
- hover: 썸네일 보더 `border.emphasized`, 카드 `translateY(-2px)`
- selected/own: 좌측 상단 owned 뱃지 추가

---

### 3.2 ReviewCard

리뷰 목록의 한 아이템.

```
[Avatar md] [닉네임] [user-tag] [별점 ★★★★☆]    [⋮]
            본문 (line-clamp: 4)
            [좋아요 12] [댓글 3] [share]   2일 전
```

- 컨테이너: `bg.subtle` 또는 `bg.surface`, `border.default`, `radii.lg`, padding `5`
- 별점은 accent 색 5개, 빈 별은 `gray.700`

---

### 3.3 PartyCard

파티 모집 글 카드. **success 컬러 도메인.**

```
[PARTY tag]  [모집중/마감임박/마감]
타이틀 (h3)
[게임 thumb 36×48] 게임명 · 플랫폼
─────────────
인원: ●●●○○ 3/5 (mono)
시간: 2025-12-01 21:00 (mono)
마감까지: 2일 13시간 (success.fg)
[참여 신청] (primary 사이즈 lg)
```

- 보더: `border.default`, 마감임박일 때 좌측 3px `warning.default` 보더 추가

---

### 3.4 CommentThread

```
[Avatar sm] [닉네임] [OP] [user-tag]  ·  2시간 전
            [본문 (멘션 @닉네임은 accent.fg)]
            [▲ 12  |  ▼] [답글] [공유] [수정] [⋮]
            ↳ 답글들 (왼쪽 2px line, 14px padding-left, avatar xs)
```

- 정렬 옵션 헤더: 좋아요순(기본) / 최신순 / 오래된순 → 버튼 탭
- 글쓴이 댓글에는 `OP` 뱃지(`accent.default` 배경, 흰 텍스트, 9.5px)
- 인라인 컴포저(접힌 상태): avatar + 가짜 input + 작은 액션 아이콘들

---

### 3.5 AuthorHoverCard

사용자 닉네임에 hover 시 280px 카드.

```
[Avatar xl] 닉네임 · 가입일 mono
[관심 태그들 (Tag.tone=review)]
[stats 3-col: 글수 / 팔로워 / 평균★]
[팔로우 (primary sm)] [메시지 (secondary sm)]
```

- 위치: `top: calc(100% + 6px); left: -12px`
- `bg.canvas`, `border.emphasized`, `radii.xl`, `shadows.lg`

---

### 3.6 MatchScore

GAMBITI의 시그니처: AI 추천 매칭률 시각화. **균형형 변형에서만 사용.**

- **Pill 뱃지** (카드 위 오버레이): `mono 12 / 700`, `bg: rgba(0,0,0,.65)` + blur, `border: 1px solid accent`, `accent.fg`. e.g. `94% MATCH`
- **Bar** (카드 아래): height 4, `bg: border.default`, fill `linear-gradient(90deg, accent.default, orange.400)`
- **Ring** (히어로): 74×74 원형 progress, conic-gradient, 내부 60×60 `bg.canvas` 코어, mono 17 / 700 accent 숫자

---

### 3.7 TypeTag (게시글 타입)

`Tag`의 도메인 인스턴스 — 4종(`review`, `party`, `guide`, `notice`).
글 헤더에서 제목 위에 1개 표시. 결과 리스트의 좌측 컬러바와 매칭.

---

### 3.8 GenreSelector (홈)

- 가로 grid: `[Title] [G1] [G2] [G3] … [G8]`
- 각 장르: 위 42×42 원형 아이콘(이모지/Lucide) + 아래 13/500 라벨
- 활성: 아이콘 보더 `accent`, 배경 `accent.soft`, 라벨 `accent.fg`

---

### 3.9 FilterSidebar (검색)

- 폭 260, sticky `top: 88`
- 필터 그룹: 그룹명(mono caption) + 옵션 리스트(체크박스 + 라벨 + 카운트)
- price-range, 토글 옵션 포함
- 푸터에 초기화 / 적용 버튼 2개 (secondary / primary)

---

### 3.10 BuyCard (게임 상세 사이드바)

- sticky `top: 88`, `radii.2xl`, `border.default`
- 가격 영역(할인 시 원가 strikethrough + 할인율 accent), CTA 2개(primary "구매", secondary "위시리스트"), 추가 메타 행

---

### 3.11 LinkPreview

본문에 붙은 외부 링크 OG 카드.

- 좌측 정사각 썸네일(140×140), 우측 도메인(mono caption)/타이틀/설명
- Discord 링크는 `border: discord` + 좌측 컬러 강조
- Steam 링크는 별도 토큰 미정 — 추후 추가

---

### 3.12 StickyReactionBar

게시글 하단 sticky bar.

- 폭 max-width 520, `radii.full`, `bg: rgba(20,20,22,.96)` + blur, `border.emphasized`, `shadows.lg`
- 액션: 좋아요(danger 컬러 활성) · 스크랩(warning 컬러 활성) · 공유 · 우측 끝 "댓글로 이동" CTA(accent)

---

### 3.13 RatingInput (리뷰 작성)

별 5개 → 큰 클릭 영역 + 호버 시 좌측부터 채우기. 별 사이즈 28px.

---

### 3.14 GameSearchPicker (글쓰기·파티 모집의 게임 검색)

```
[ 입력 ............................. (Esc 클리어) ]
  ↓ 자동완성 드롭다운(최대 6개)
  [thumb 36×48] [title] [year · genre]
```

자동완성: `bg.canvas`, `border.emphasized`, `shadows.lg`, max-height 320, scroll.

---

## 4. 페이지 레이아웃

### 4.1 글로벌 셸

```
┌──────────────────────────── g-header (60px, bg.canvas, border-bottom) ────────┐
│ [Logo] [Nav]                                          [Search 280] [Avatar]   │
└────────────────────────────────────────────────────────────────────────────────┘
                                       ↓
                              Page content (max-w containerLg, padding 7~8)
                                       ↓
┌─────────────── g-footer (border-top, fg.subtle 12.5) ──────────────────────────┐
└────────────────────────────────────────────────────────────────────────────────┘
```

- Logo: `display` 폰트, italic, letter-spacing widest, "GAMBITI" + 22px G 심볼 SVG
- Nav: 22px gap, on 상태 시 하단 -19px에 2px accent 바
- Search: `radii.full`, min-width 280, `bg.surface`, mono 12.5

### 4.2 2-Column Detail/Form Layout

```
[ main column (min-w 0, 1fr) ] [ sidebar (320 / 360, sticky top 88) ]
                               gap: 9 (36px)
```

- 글쓰기 폼: side = `side-guide` 카드 스택
- 상세 페이지: side = `BuyCard` 또는 TOC + 관련 카드
- 1100px 미만에서는 1열로 fallback

### 4.3 Hero (홈 상세, 게임 상세)

- 풀블리드, min-height 460, 좌측 정렬 텍스트(max-w 640)
- 배경 = `radial-gradient(accent 32% glow) + linear-gradient(canvas → transparent) + 좌→우 페이드`
- 디테일 페이지는 좌측 하단에 키비주얼 캡션(mono 10.5, 우측 하단)
- 히어로 내부 버튼은 backdrop-blur 적용 — frame 위에서 가독성 유지

---

## 5. 사용 규칙 / 컨벤션

### 5.1 색 사용 규칙
- **액센트는 절약한다.** 한 화면에서 accent 사용은 (CTA 1개) + (활성 탭/링크) + (강조 메타) 정도. 카드마다 액센트 보더 금지.
- **빨간색(danger)은 삭제/오류에만.** "취소" 같은 비파괴 행동에 빨강 금지.
- **노랑(warning/note)은 주의/스포일러/공지 외 금지.**
- **본문 텍스트는 `fg.default`**, 보조는 `fg.muted`, 캡션은 `fg.subtle`. 4단계 이상 위계 금지.

### 5.2 타이포 규칙
- 메타·시간·카운트·URL·키캡은 **무조건 mono**.
- 본문 안에서 폰트 weight 3종(400/600/700)을 넘지 말 것.
- 헤딩 letter-spacing: `tight` (-0.5px) 이상은 30px 이상에만.

### 5.3 레이아웃 규칙
- **flex/grid + `gap`만 사용**. 형제 간 마진으로 간격 만들지 말 것.
- 모든 측정값 4px 그리드 정렬. 13px/14.5px 같은 홀수는 금지(텍스트 사이즈 제외).
- 사이드바는 `position: sticky; top: 88`이 표준(헤더 60 + 여유 28).

### 5.4 인터랙션 규칙
- 클릭 가능한 요소는 모두 `cursor: pointer` + hover 상태 시각화.
- focus는 반드시 `shadows.focusRing` (브랜드 ring) — outline 제거 금지하면서 ring 안 주는 것 금지.
- 모든 transition은 `durations.base` + `easings.standard` 기본.

### 5.5 접근성
- 본문 14px / line-height 1.55 이상, 보조 12px 이상 유지.
- 명도 대비: 본문 ≥ AA(`fg.default` vs `bg.canvas` ≈ 16:1 ✅), 캡션 ≥ AA(`fg.subtle` vs `bg.canvas` ≈ 4.6:1 ✅).
- 모든 인터랙티브 요소에 `aria-label` 또는 보이는 텍스트 라벨 필수.
- 모달은 focus trap + Esc 닫기 + 백드롭 클릭 닫기 + 스크롤 락(Park UI 기본).

---

## 6. 파일 구조 (제안)

```
src/
├─ styled-system/             # panda codegen 산출물 (gitignore)
├─ components/
│  ├─ ui/                     # Primitives (Park UI 래핑)
│  │  ├─ button.tsx
│  │  ├─ input.tsx
│  │  ├─ tag.tsx
│  │  ├─ chip.tsx
│  │  ├─ card.tsx
│  │  ├─ dialog.tsx
│  │  ├─ toast.tsx
│  │  ├─ menu.tsx
│  │  ├─ tabs.tsx
│  │  └─ ...
│  └─ feedback/               # Park UI에 없어 직접 만드는 도메인 무지 공통 (EmptyState, SkeletonLoader, Timer ...)
├─ features/<domain>/components/   # 도메인 컴포넌트 (도메인 지식 필요)
│     ├─ GameCard.tsx              # features/game/components/
│     ├─ ReviewCard.tsx
│     ├─ PartyCard.tsx
│     ├─ CommentThread.tsx
│     ├─ AuthorHoverCard.tsx
│     ├─ MatchScore.tsx
│     ├─ TypeTag.tsx
│     ├─ FilterSidebar.tsx
│     └─ ...
├─ layout/                    # 앱 셸 (전역 1회)
│  ├─ RootLayout.tsx          # Header + Outlet + Footer
│  ├─ HeaderBar.tsx
│  └─ Footer.tsx
├─ pages/                     # Next.js or Vite routes
└─ panda.config.ts
```

---

## 7. 페이지 ↔ 컴포넌트 매핑 (참조)

| 페이지 | 핵심 컴포넌트 |
|---|---|
| 01·02 홈 | `Hero`, `GenreSelector`, `GameCard`(conservative/balanced), `MatchScore`(ring/bar) |
| 03 게임 상세 | `Hero`, `BuyCard`(side), `LinkPreview`, `ReviewCard`, `RelatedRow` |
| 04 검색 | `SearchHero`, `FilterSidebar`, `Chip`(active filters), `GameCard.list`, `EmptyBlock` |
| 05 추천 | `TasteCards`, `MatchScore`, `GameCard`(balanced) |
| 06 커뮤니티 | `TabsHeader`, `PostListItem`, `TypeTag` 4종 |
| 07 마이페이지 | `LibraryGrid`, `TasteSummary`, `StatsCard` |
| 08 인증 | `AuthCard`(중앙 카드 + OAuth 버튼들) |
| 09 Steam 연동 | `StepProgress`, `SyncProgress`, `Toast`(완료) |
| 10 온보딩 | `StepProgress`, `Chip`(다중선택), `RadioSeg` |
| 11~14 작성 | `Field`, `Input/Textarea/Select`, `Chip`(pickers), `Switch`(toggle-row), `GameSearchPicker`, `ActionBar`(sticky) |
| 12 리뷰 | + `RatingInput` |
| 13 파티 | + `Field.green` 변형, 인원/시간 입력 |
| 15~17 게시글 상세 | `Breadcrumb`, `PostHeader`, `AuthorHoverCard`, `pd-body`, `CommentThread`, `StickyReactionBar`, `PrevNextCard` |
| 18 글 수정 | 위 + `EditModeBanner`(상단 노란 배너), `Menu`(수정/삭제) |

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 |
|---|---|---|
| 0.1.0 | 2026-05-28 | 와이어프레임 v0.8에서 최초 추출. 18개 페이지 / 2개 base CSS 기준. |

---

**다음 단계 (Claude Code에게 위임 가능한 작업)**
- [ ] `panda.config.ts` 그대로 적용 후 `pnpm panda codegen` 실행
- [ ] `components/ui/*` 부터 1개씩 구현 — 우선순위: `Button` → `Input/Textarea/Select` → `Field` → `Tag`/`Chip` → `Card` → `Dialog` → `Toast` → `Menu` → `Tabs` → `Avatar`
- [ ] 이후 `features/<domain>/components/*` (도메인 컴포넌트) — 우선순위: `GameCard` → `ReviewCard` → `TypeTag` → `CommentThread` → `PartyCard` → `MatchScore`
- [ ] 각 컴포넌트는 Park UI Ark 베이스 + 본 문서의 anatomy/variant/size 강제
