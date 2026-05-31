# `src/components/ui` — 공용 UI Primitive

도메인 무지(domain-agnostic) UI primitive 모음. Park UI base(`@ark-ui/react` factory)에
GamBTI recipe(`styled-system/recipes`)를 덮어쓴 스타일 컴포넌트만 둔다.

## 규칙

- **recipe는 소비만** 한다. 토큰/recipe 정의(`src/theme/recipes/*`, `panda.config.ts`)는 여기서 수정하지 않는다(변경 시 cross 흐름).
- 색은 **semantic token만** 사용한다. recipe가 이미 토큰을 쓰므로 컴포넌트에 primitive/hex/인라인 style을 추가하지 않는다.
- 다크 모드 전용 · 데스크탑 전용. (Storybook preview에 이미 적용되어 스토리에서 별도 처리 불필요.)
- 각 컴포넌트는 `*.tsx` + `*.stories.tsx`(story-first) 쌍으로 작성한다.

## 등재 컴포넌트

| 컴포넌트 | 파일 | recipe | variant | 용도 |
|---|---|---|---|---|
| `Button` | `Button.tsx` | `button` | variant(primary/secondary/ghost/danger/dangerSolid), size(sm/md/lg) | 액션 버튼 |
| `Tag` | `Tag.tsx` | `tag` | tone(neutral/review/party/guide/notice), filled(boolean) | 읽기 전용 라벨/카테고리(선택형은 Chip) |
| `Chip` | `Chip.tsx` | `chip` | 없음 (선택 상태는 소비자가 `data-state="on"`/`.on`으로 전달) | 클릭 토글형 필터/장르/성향 선택(button element) |

## Button 패턴 (신규 primitive 추가 절차)

`Button.tsx`가 표준 레퍼런스다. 새 primitive는 다음을 그대로 따른다.

1. **story-first**: `<Name>.stories.tsx` 골격을 먼저 작성해 시각/계약(argTypes)을 고정한다.
2. **구현**: `<Name>.tsx`에서 `styled(ark.<element>, <recipe>)`로 래핑한다.
   - 인터랙션 요소면 해당 element(`ark.button` 등), 읽기 전용 라벨이면 `ark.span` 등을 쓴다.
   - `<Recipe>VariantProps`를 `<Name>Props`로 re-export 한다.
   - recipe는 소비만 — 스타일 추가 금지.
3. **스토리 본문 채우기**: variant별 개별 스토리 + 전체 나열 스토리(`hstack`)를 작성한다.
4. **검증**: `pnpm type-check` / `pnpm lint`, recipe·`panda.config.ts` 무변경 확인, 이 README에 등재.
