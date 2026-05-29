# src/theme — 디자인 시스템 규칙 본진 (단일 진실)

GAMBITI의 Panda CSS 토큰/시맨틱/recipe/textStyles 정의가 여기 모여 있다.
루트 `panda.config.ts`는 이 디렉터리를 조립해 `styled-system/`을 생성한다.

## 구조

```
src/theme/
├─ index.ts            # 조립 진입점 (themeExtend + textStyles export)
├─ tokens.ts           # primitive 토큰 (colors/fonts/spacing/radii/shadows ...)
├─ semantic-tokens.ts  # 의미 토큰 (bg/fg/border/accent/success/warning/danger/info)
├─ text-styles.ts      # textStyles 프리셋 (heading/body/caption/code)
└─ recipes/
   ├─ index.ts         # recipe 모음 (새 recipe 등록 지점)
   ├─ button.ts        # key: button
   ├─ input.ts         # key: input
   ├─ tag.ts           # key: tag
   ├─ chip.ts          # key: chip
   └─ game-card.ts     # key: gameCard (파일명만 케밥, 키는 gameCard)
```

> ⚠️ `textStyles`는 `panda.config.ts`에서 `theme.extend` **밖**(theme 직속)에 등록한다.
> 나머지(tokens/semanticTokens/recipes)는 `theme.extend`에 들어간다. (`index.ts`의 `themeExtend`)

## 규칙 (반드시 지킬 것)

### 1. semantic token만 사용 (primitive 직접 금지)
컴포넌트/페이지에서는 `bg.surface`, `fg.default`, `accent.default` 같은 **의미 토큰만** 쓴다.
`gray.900`, `orange.500` 같은 primitive나 raw hex는 `tokens.ts` / `semantic-tokens.ts` 정의 내부에서만 참조한다.

### 2. 토큰 변경 = cross 흐름
`panda.config.ts` 및 이 디렉터리의 토큰/시맨틱/recipe/textStyles 값을 바꾸는 작업은 전역 영향이라
**무조건 cross 흐름**(티켓 + PR + 1명 승인, 본인 머지 금지)이다. 값을 바꾸면 `styled-system/` 산출물이 달라진다.

### 3. docs/design 원본 직접 수정 금지
디자인 토큰의 출처(SSOT)는 `docs/design/`(DesignEx 스냅샷)이다. 이 원본은 직접 수정하지 않는다.
토큰을 바꿔야 하면 DesignEx 출처를 통해 갱신한 뒤 이 디렉터리에 반영한다.

### 4. 새 recipe 추가 절차
1. `recipes/<name>.ts`를 만들고 `defineRecipe`로 정의한다.
2. `recipes/index.ts`의 `recipes` 객체에 한 줄로 등록한다.
3. 등록 key는 `styled-system` 산출물 이름과 직결되므로, 기존 key는 변경하지 않는다.
4. `pnpm panda codegen` 후 산출물을 확인한다.
