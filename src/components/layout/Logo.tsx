import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';

// 글로벌 셸 로고 (DESIGN_SYSTEM 4.1 + Figma g-header).
// 구성: [G 심볼 마크] + "GAMBITI" 워드마크(display 폰트 italic, letterSpacing widest).
// 마크는 Figma SVG(node 387:4677)에서 추출한 벡터. 색은 하드 hex 대신 currentColor로 받아
// accent.default 토큰을 따른다(semantic token만, 신규 토큰/recipe 없음).

// G 심볼 마크 — 헤더/푸터에서 재사용. 크기는 부모 font-size(em)에 비례한다.
// 장식 요소이므로 aria-hidden (서비스명은 워드마크 텍스트 + 링크 aria-label이 전달).
export function LogoMark() {
  return (
    <svg
      width="33"
      height="22"
      viewBox="0 0 33 22"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={css({
        h: '1em',
        w: 'auto',
        flexShrink: 0,
        color: 'accent.default',
      })}
    >
      <path
        d="M10.0834 18.3337L14.6667 3.66699H27.5L26.5834 6.87533H17.4167L14.6667 15.5837H22L22.9167 12.3753H20.1667L21.0834 9.62533H27.5L25.2084 18.3337H10.0834Z"
        fill="currentColor"
      />
      <g opacity="0.55">
        <path
          d="M0.916626 6.41699H6.41663"
          stroke="currentColor"
          strokeWidth="1.375"
          strokeLinecap="round"
        />
        <path
          d="M0 11H7.33333"
          stroke="currentColor"
          strokeWidth="1.375"
          strokeLinecap="round"
        />
        <path
          d="M0.916626 15.584H6.41663"
          stroke="currentColor"
          strokeWidth="1.375"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <Link
      to="/"
      // 접근명: 마크는 장식이고 워드마크가 시각 텍스트이므로 aria-label로 서비스명을 명확히 한다.
      aria-label="GAMBITI 홈"
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2',
        fontSize: 'xl',
        lineHeight: 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        flexShrink: 0,
        // hover 시 워드마크만 accent로(마크는 항상 accent). 마크 크기는 fontSize(em) 기준.
        _hover: { '& [data-logo-word]': { color: 'accent.default' } },
      })}
    >
      <LogoMark />
      <span
        data-logo-word
        className={css({
          fontFamily: 'display',
          fontStyle: 'italic',
          letterSpacing: 'widest',
          color: 'fg.default',
          textTransform: 'uppercase',
          transition: 'color {durations.fast}',
        })}
      >
        GAMBITI
      </span>
    </Link>
  );
}
