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
| `Input` | `Input.tsx` | `input` | size(sm/md/lg) | 텍스트 입력(input element). invalid는 소비자가 `aria-invalid={true}`로 전달, 폼 로직(RHF/Zod)은 소비자 책임. 글로벌 셸 Search(`layout/Header.tsx`)가 size sm + 인스턴스 className override(`radii.full`·min-width 280·mono)로 재사용 — 새 recipe/variant 추가 없이 css merge 로만 형태를 맞춘다 |
| `SearchInput` | `SearchInput.tsx` | `input` | Input의 size(sm/md/lg) | Lucide 검색 아이콘과 입력 내부 여백을 공통 관리한다. 검색 상태·제출 방식은 소비자가 소유한다. |
| `GameCard` | `GameCard.tsx` | `gameCard` | padding(none/sm/md/lg), interactive(boolean), tone(default/accent) | children을 감싸는 thin 컨테이너(div element). `interactive`는 hover 시각 효과만, 클릭/role/키보드 a11y와 내부 레이아웃은 소비자 책임 |
| `Field` | `Field.tsx` | 없음(조합) | 없음 (props: `label`/`id`/`required?`/`hint?`/`help?`/`error?`/`children`) | 폼 래퍼. `styled-system/patterns`(vstack)+`css`(기존 textStyles 매핑+semantic token)로 label row→입력 children 슬롯→help→error를 조합. `htmlFor`/`aria-required`/`aria-invalid`/`aria-describedby`를 children 입력에 주입(a11y). error 존재 시 help 대신 error 표시. RHF/Zod 미결합 — `error` 문자열 생성은 소비자 책임 |
| `Avatar` | `Avatar.tsx` | 없음(조합) | 없음 (props: `size`(xs/sm/md/lg/xl, 기본 md)/`src?`/`name`/`op?`) | 유저 표시 primitive(DESIGN_SYSTEM 2.6). Ark UI Avatar(Root/Image/Fallback) 위에 `css`(기존 sizes 토큰 `avatarXs`~`avatarXl`+semantic token)만 얹어 원형 이미지 + 이니셜 fallback을 조합. `src` 미제공/로드 실패 시 `name` 기반 이니셜로 자동 전환(Ark). `op`(글쓴이)는 `border.accent`+`accent.default`로 강조. a11y는 Root `aria-label={name}`+이미지 `alt`(이니셜은 `aria-hidden`). 도메인 로직(데이터 패칭) 미결합 — `src`/`name`은 소비자 주입 |
| `ProfileAvatar` | `ProfileAvatar.tsx` | 없음(조합) | size(header/profile) | 헤더와 마이페이지에서 공유하는 주황색 원형 프로필 이미지. 공통 에셋과 내부 여백을 한곳에서 관리한다. |
| `Toast` | `Toast.tsx` | `toast`(slot recipe) | 없음 (API: `toaster`, `Toaster`) | Park UI Toast 기반 전역 피드백. `GlobalShell`에서 `Toaster`를 렌더하고, 소비자는 `toaster.create({ title, type })` 또는 `toaster.*`를 호출한다 |
| `ProgressBar` | `ProgressBar.tsx` | 없음(조합) | 없음 (props: `value`/`label?`/`size?`) | Ark UI Progress 기반 선형 진행률. `size="sm"`은 카드용 얇은 막대, `size="md"`는 설문 하단처럼 더 높은 막대에 사용 |
| `Spinner` | `Spinner.tsx` | `spinner` | size(xs/sm/md/lg/xl) | Park UI preset spinner recipe를 감싼 로딩 primitive. 기본 `role="status"`/`aria-label`을 제공하고, 화면별 색상은 `color="accent.default"`처럼 semantic token prop으로 조정 |

## Toast 사용 패턴

`Toaster`는 `layout/GlobalShell.tsx`에서 전역 1회 렌더한다. 페이지·컴포넌트·훅에서는 `toaster`만 import해서 호출한다.

```tsx
import { toaster } from '@/components/ui/Toast';

toaster.success({
  title: '저장 완료',
  description: '정상적으로 처리되었습니다.',
  closable: true,
});
```

ky 호출은 `src/services/*`에서 도메인 에러로 정규화하고, 화면에서는 성공/실패 결과에 맞춰 Toast를 띄운다.

```tsx
import { toaster } from '@/components/ui/Toast';
import { login, LoginError } from '@/services/auth';

try {
  await login(payload);
  toaster.success({ title: '로그인 완료', closable: true });
} catch (error) {
  const description =
    error instanceof LoginError && error.kind === 'invalid-credentials'
      ? '이메일 또는 비밀번호를 확인해주세요.'
      : '잠시 후 다시 시도해주세요.';

  toaster.error({ title: '로그인 실패', description, closable: true });
}
```

## Button 패턴 (신규 primitive 추가 절차)

`Button.tsx`가 표준 레퍼런스다. 새 primitive는 다음을 그대로 따른다.

1. **story-first**: `<Name>.stories.tsx` 골격을 먼저 작성해 시각/계약(argTypes)을 고정한다.
2. **구현**: `<Name>.tsx`에서 `styled(ark.<element>, <recipe>)`로 래핑한다.
   - 인터랙션 요소면 해당 element(`ark.button` 등), 읽기 전용 라벨이면 `ark.span` 등을 쓴다.
   - `<Recipe>VariantProps`를 `<Name>Props`로 re-export 한다.
   - recipe는 소비만 — 스타일 추가 금지.
3. **스토리 본문 채우기**: variant별 개별 스토리 + 전체 나열 스토리(`hstack`)를 작성한다.
4. **검증**: `pnpm type-check` / `pnpm lint`, recipe·`panda.config.ts` 무변경 확인, 이 README에 등재.
