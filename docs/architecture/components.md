# components.md — 컴포넌트 구조

## 핵심 규칙 (인라인 룰 추출용)

- **공통(common)의 기준은 도메인 무지(domain-agnostic)**: 도메인 지식이 없어야 `components/`에 둔다.
- 공용 Primitive는 `src/components/ui/` (Park UI base + GamBTI recipe 덮어쓰기).
- Park UI에 없어 직접 만드는 공통은 `src/components/feedback/`.
- 도메인 지식을 아는 컴포넌트는 `src/features/<domain>/components/` (예: GameCard는 게임 도메인 소속).
- **도메인 컴포넌트가 다른 도메인을 import 금지** (격리).
- **의존 방향은 한 방향**: `features/ → components/`, `layout/ → components/`. 역방향(공통이 features를 import) 금지.
- 페이지/라우트 컴포넌트는 비즈니스 로직 최소화 (훅으로 위임).
- 컴포넌트는 DESIGN_SYSTEM.md의 anatomy/variant/size를 그대로 따른다 (임의 변형 금지).

## 폴더/파일 위치

```
src/
├── components/                  # 공통 — 도메인 무지
│   ├── ui/                      # Park UI base + GamBTI recipe
│   │   ├── Button/              # AuthButton/Steam은 variant로 파생
│   │   ├── Input/
│   │   ├── Field/               # Input + ValidationMessage 조합
│   │   ├── Dialog/              # = Modal
│   │   ├── Toast/
│   │   ├── Tooltip/
│   │   ├── Avatar/
│   │   ├── Progress/            # = ProgressBar
│   │   ├── Badge/               # StatBadge의 base 모양
│   │   └── Card/                # GameCard/WarningCard의 base 모양
│   └── feedback/                # Park UI에 없어 직접 만드는 공통
│       ├── EmptyState/
│       ├── SkeletonLoader/
│       └── Timer/               # 표시부만 (로직은 hooks)
│
├── features/                    # 도메인 특화 — 공통 아님
│   ├── auth/
│   │   └── components/          # AuthButton은 ui/Button variant 재사용
│   ├── survey/
│   │   └── components/
│   │       └── LikertScale/
│   ├── tendency/
│   │   └── components/
│   │       ├── RadarChart/      # 6대 성향 차트 (Recharts 래핑)
│   │       └── StatBadge/       # 대표 성향 태그 칩
│   ├── game/
│   │   └── components/
│   │       ├── GameCard/        # 썸네일+이름+태그, 메인·추천·검색 화면 공용
│   │       ├── WarningCard/     # ui/Card + 빨강 테두리 + 충돌 사유
│   │       └── GameDetailSection/
│   ├── chat/
│   │   └── components/
│   │       ├── ChatFloatingButton/   # 정의는 여기, 렌더는 RootLayout
│   │       └── ChatWindow/
│   └── community/
│       └── components/
│           └── PostItem/
│
├── layout/                      # 앱 셸
│   ├── RootLayout/              # 안에서 <HeaderBar/> <Outlet/> <Footer/> + <ChatFloatingButton/>
│   ├── HeaderBar/               # REQ-USER-001, 로그인/비로그인 공통
│   └── Footer/
│
├── routes/
│   └── guards/                  # AuthGuard — React Router layout route + loader 패턴
│
└── hooks/
    └── useCountdown.ts          # Timer 로직 (표시부와 분리)
```

## 분류 기준 (공통 vs feature)

| 구분 | 기준 | 예시 |
|---|---|---|
| `components/ui/` | Park UI base를 recipe로 덮어쓴 것. 새로 만들지 않음 | Button, Input, Dialog, Card, Badge |
| `components/feedback/` | Park UI에 없어 직접 만드는 도메인 무지 공통 | EmptyState, SkeletonLoader, Timer |
| `features/<domain>/components/` | 도메인 "의미"를 알아야 동작 | GameCard, WarningCard, RadarChart, StatBadge, LikertScale, PostItem, ChatWindow |
| `layout/` | 앱 셸 (전역 1회) | RootLayout, HeaderBar, Footer |

> ⚠️ WarningCard·StatBadge는 헷갈리기 쉽다. "비선호 태그 충돌", "대표 성향" 같은 **의미**를 알아야 하므로 feature다. 단 시각 base(테두리 Card, 칩 Badge)는 `ui/`에서 가져와 얹는다.

## MVP 범위 메모

- **Sidebar/MobileNav 제외**: 데스크탑 전용(1100px 미만 1열 fallback만)이라 모바일 사이드바는 MVP 밖.
- **AuthGuard는 컴포넌트가 아니라 라우팅 가드**: `routes/guards/`에서 React Router layout route + loader 패턴으로.

## RootLayout 렌더 그림

```tsx
function RootLayout() {
  return (
    <>
      <HeaderBar />
      <Outlet />              {/* 각 페이지가 여기 들어옴 */}
      <Footer />
      <ChatFloatingButton />  {/* features/chat에서 import, 전역 1회 */}
    </>
  )
}
```

## 패턴

```typescript
// ✅ 도메인 컴포넌트가 공용 UI 사용
import { Button } from '@/components/ui/Button';
export function LoginForm() { ... }

// ✅ 페이지가 도메인 컴포넌트 import
import { GameCard } from '@/features/game/components/GameCard';

// ✅ layout이 features 컴포넌트를 렌더 (단방향)
import { ChatFloatingButton } from '@/features/chat/components/ChatFloatingButton';
```

## 안티패턴

```typescript
// ❌ 도메인 간 import (features/auth가 features/community를 import)
import { PostList } from '@/features/community/components/PostList';

// ❌ 공통이 features를 import (역방향 의존)
//    components/ui/* 는 features/* 를 절대 import하지 않는다

// ❌ Button에 아이콘만 넣기 → IconButton 사용
// ❌ Tag와 Chip 혼용 (정보 표시=Tag, 선택형=Chip)
```

## 관련 문서
- `styling.md` (Panda + Park UI 룰)
- `routing.md` (AuthGuard / layout route 패턴)
- `../../docs/design/DESIGN_SYSTEM.md` (컴포넌트 사양)
