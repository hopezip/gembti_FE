# styling.md — 스타일링 (Panda CSS + Park UI)

## 핵심 규칙 (인라인 룰 추출용)

- **semantic token만 사용** (`bg.surface`, `fg.default`, `accent.default` ...). primitive(`gray.900`, hex)는 토큰 정의 내부에서만.
- 컴포넌트는 Park UI 베이스 + `panda.config.ts`의 recipe로 스타일링. 인라인 style/임의 hex 금지.
- **다크 모드 전용 · 데스크탑 전용** (1100px 미만 1열 fallback만). 라이트 모드/모바일 토큰 추가 금지.
- `panda.config.ts` / 디자인 토큰 변경은 **무조건 cross 흐름** (전역 영향). 토큰 SSOT는 `docs/design`.

## 폴더/파일 위치

- `panda.config.ts` (루트) — 토큰·recipe·textStyles 정의 (DesignEx에서 가져옴)
- `styled-system/` — `pnpm panda codegen` 산출물 (gitignore)
- `src/components/ui/` — Park UI 래핑 Primitive

## 핵심 토큰 (요약, 전체는 DESIGN_SYSTEM.md)

- 배경: `bg.canvas`(최하층) / `bg.subtle` / `bg.surface`(카드 기본) / `bg.surfaceRaised`
- 텍스트: `fg.default`(본문) / `fg.muted`(보조) / `fg.subtle`(캡션)
- 액센트: `accent.default`(#ef5a2c) / `accent.soft` / `accent.fg`
- 보더: `border.default` / `border.emphasized` / `border.accent`
- 도메인: 리뷰=accent / 파티=success / 공략=info / 공지=warning
- 폰트: `sans`(Noto Sans KR) / `mono`(JetBrains Mono, 메타·캡션) / `display`(Archivo Black, 로고 전용)

## 패턴

```tsx
import { css } from 'styled-system/css';

// ✅ semantic token + css 함수
<div className={css({ bg: 'bg.surface', color: 'fg.default', borderRadius: 'xl', p: '5' })} />

// ✅ recipe 사용
import { button } from 'styled-system/recipes';
<button className={button({ variant: 'primary', size: 'md' })}>저장</button>
```

## 안티패턴

```tsx
// ❌ 인라인 style
<button style={{ background: '#ef5a2c', color: 'white' }}>

// ❌ primitive / hex 직접
<div className={css({ bg: 'gray.900' })} />   // → bg.surface 사용
<div className={css({ bg: '#1a1a1d' })} />

// ❌ primary 버튼을 한 화면에 2개 이상
// ❌ mono 폰트 없이 메타/날짜/카운트 표시
```

## 관련 문서
- `components.md` (공용 컴포넌트 위치)
- `../../docs/design/DESIGN_SYSTEM.md` (토큰·컴포넌트 전체 사양)
- `../../docs/design/panda.config.ts` (토큰 정의 원본)
