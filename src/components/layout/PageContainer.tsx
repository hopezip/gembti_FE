import type { ReactNode } from 'react';
import { css, cx } from 'styled-system/css';

// 페이지 좌우 거터 / 콘텐츠 폭 단일 출처.
//
// 모델: "2층" — 거터(px)는 전체폭 요소에, maxW는 안쪽 요소에 둔다.
//   · 거터를 cap 바깥에 둬서 콘텐츠 폭이 정확히 containerLg(1280)가 되도록 한다.
//     (같은 div에 maxW+px를 주면 box-sizing border-box 때문에 콘텐츠가 1280−2*거터로 좁아져
//      다른 영역과 좌우 라인이 어긋난다. 그 정렬 어긋남을 막기 위한 분리다.)
//   · 거터는 뷰포트가 1280 아래로 좁아질 때만 콘텐츠를 민다(데스크탑 전용 + 1100 fallback 구간).
//   · Header/Footer처럼 bg·border가 화면 끝까지 닿아야 하는 요소는 컴포넌트 대신
//     pageGutter/pageContainer 스타일 조각을 직접 합성한다(시맨틱 태그·추가 스타일 유지).

// 좌우 거터 — 전체폭 요소(header/footer/섹션)에 적용. ⭐ 값 변경은 여기 한 곳에서만.
export const pageGutter = css.raw({ px: '6' }); // 24px

// 콘텐츠 최대폭 + 중앙정렬 — 안쪽 요소에 적용.
// 콘텐츠폭 = 1280 cap − 좌우 거터(24px×2) = 1232px.
//   디자인 SSOT(Figma) 카드 그리드 규격이 "1280 좌우24 기준 카드 290 / 간격 24"이며
//   290×4 + 24×3 = 1232 로 정확히 맞는다(TASK-UI-011). cap을 풀폭(1280)으로 쓰면
//   와이드 뷰포트에서 4열 카드가 (1280−72)/4=302 로 커져 규격을 벗어나므로 1232로 고정한다.
//   토큰(containerLg=1280, spacing.6=24)은 변경하지 않고 calc로 참조만 한다.
export const pageContainer = css.raw({
  maxW: 'calc(token(sizes.containerLg) - token(spacing.6) * 2)',
  mx: 'auto',
});

// 풀폭 bg/border가 필요 없는 일반 콘텐츠 영역용(새 페이지 기본).
// className 은 안쪽(콘텐츠) 요소에 적용된다 — flex/gap/py 등 레이아웃을 여기에 준다.
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={css(pageGutter)}>
      <div className={cx(css(pageContainer), className)}>{children}</div>
    </div>
  );
}
