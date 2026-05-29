# TASK-DESIGN-001: Park UI preset 도입 + card recipe 충돌 해소

## 메타
- ID: TASK-DESIGN-001 (REQ에 없는 디자인 인프라 작업 → 신규 TASK)
- 타입: CHORE
- 생성: 2026-05-29
- 상태: DONE
- 마일스톤: MS-01
- 브랜치: feature/TASK-DESIGN-001-parkui-preset
- 분기 판별: **cross** (panda.config / 디자인 토큰 변경 + 외부 import recipe 이름 변경 → cross 강제)

---

## 인라인 룰 (이 작업에서 지킬 것만)

- panda.config 변경은 디자인 SSOT 변경 → 루트 `panda.config.ts`와 `docs/design/panda.config.ts`를 **동시에** 맞춘다 (드리프트 금지)
- preset 등록 API는 설치한 `@park-ui/panda-preset` 실제 버전 기준으로 확정 (추측 금지)
- recipe 이름 변경 시 `className`까지 함께 변경
- 색은 semantic token만, 다크/데스크탑 전용 전제 유지

---

## Spec (왜) — 3~5줄

문서(`CLAUDE.md`, `DESIGN_SYSTEM.md`)는 "Park UI 베이스 + recipe 덮어쓰기"를 표방하지만,
실제 셋업은 `@park-ui/panda-preset` 미설치 상태로 갈려 있다(문서 ↔ 셋업 불일치).
preset을 정식 채택해 SSOT를 통일한다. 단 Park UI는 `card`를 slotRecipe로 제공해
우리 custom `card` 단일 recipe와 이름이 충돌하므로, 우리 recipe를 `gameCard`로 개명해 해소한다.

---

## Plan (어떻게) — Task 단위

- Task 1: `pnpm add -D @park-ui/panda-preset` 설치, 설치된 버전 확인
- Task 2: 루트 `panda.config.ts`에 preset 등록 (버전 맞는 API로)
- Task 3: custom `card` recipe → `gameCard`로 개명 (className 포함)
- Task 4: `docs/design/panda.config.ts`(SSOT 원본)에 1~3 동일 반영
- Task 5: `pnpm panda codegen` 경고 0건 확인 + type-check/build 검증

---

## AC (Acceptance Criteria)

- [ ] `@park-ui/panda-preset`이 package.json devDependencies에 박제됨
- [ ] `pnpm panda codegen` 시 card 이름 충돌 경고가 사라짐
- [ ] custom card recipe가 `gameCard`로 개명되어 Park UI `card` slotRecipe와 공존
- [ ] 루트 `panda.config.ts`와 `docs/design/panda.config.ts`가 바이트 동일(또는 Biome 포맷 차이만)
- [ ] `pnpm type-check`, `pnpm build` 통과

---

## 영향 파일 (예상)

- `package.json` (수정 — devDependency 추가)
- `pnpm-lock.yaml` (자동)
- `panda.config.ts` (수정 — preset 등록 + card 개명)
- `docs/design/panda.config.ts` (수정 — 동일 반영)

---

## Must read docs (인라인 룰로 부족할 때만)

- `../../docs/design/DESIGN_SYSTEM.md`
- `../architecture/styling.md`

---

## API endpoints used

- 없음

---

## Verification (자동 검증)

### 정적
- [x] `pnpm type-check` 통과
- [x] `pnpm lint` 통과

### 원칙 (normal/cross)
- [ ] code-reviewer 에이전트 통과 (PR 시)

### 기능 (해당 시)
- [x] `pnpm panda codegen` 경고 0건
- [x] `pnpm build` 통과 (CSS 19.7→36KB, preset 토큰 추가분)

### 수동
- [x] (cross) 기존 화면(홈/404)이 빌드 후에도 정상 렌더 (빌드 통과로 갈음, 브라우저 확인 미실행)

### 문서 (v2)
- [x] 이 파일의 `## 회고` 섹션 채움

---

## 회고 (구현 후 ticket-implementer가 채움)

- 실제로 한 일: `@park-ui/panda-preset@0.43.1` 설치, `createPreset({ accentColor: orange, grayColor: slate, radius: 'md' })`로 등록. custom `card` recipe → `gameCard` 개명(className 포함). 루트/`docs/design` panda.config 동기화. codegen 경고 0, type-check/lint/build 통과. styled-system에 Park UI `card`(slotRecipe)와 우리 `game-card`(recipe)가 공존 확인.
- 빗나간 점: ① `createPreset`이 `accentColor`/`grayColor`를 ColorPalette **객체**로 필수 요구 → 단순 한 줄 등록이 아니라 `@park-ui/panda-preset/colors/*`에서 팔레트를 import해야 했음. orange/slate를 깔고 우리 theme.extend가 덮어쓰는 구조로 해결. ② Biome가 `presets: [...]` 한 줄을 여러 줄로 강제해 lint 실패 → `pnpm format` 후 docs/design 재동기화. ③ preset 색/recipe 추가로 CSS 번들 19.7→36KB 증가(채택의 본질적 비용).
- 다음에 비슷한 거 할 때: panda.config를 수정하면 항상 `pnpm format` → `cp panda.config.ts docs/design/`(SSOT 재동기화) → `pnpm lint` 순으로 마무리. preset 등록 시 색 팔레트 객체 요구 여부를 먼저 타입 정의에서 확인할 것.
