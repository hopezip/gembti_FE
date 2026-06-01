import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';

// 글로벌 셸 로고 (DESIGN_SYSTEM 4.1).
// display 폰트(Archivo Black) + italic + letterSpacing widest 로 "GAMBITI" 워드마크 표시.
// G 심볼 SVG는 텍스트로 단순화(티켓 허용) — 워드마크 자체가 식별자 역할을 한다.
// 클릭 시 메인('/')으로 이동. 색은 semantic token만(fg.default), 신규 토큰/recipe 없음.
export function Logo() {
  return (
    <Link
      to="/"
      // 접근명: 시각 텍스트가 워드마크이므로 별도 aria-label로 서비스명을 명확히 한다.
      aria-label="GAMBITI 홈"
      className={css({
        fontFamily: 'display',
        fontStyle: 'italic',
        letterSpacing: 'widest',
        fontSize: 'xl',
        lineHeight: 'none',
        color: 'fg.default',
        textTransform: 'uppercase',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        flexShrink: 0,
        _hover: { color: 'accent.default' },
      })}
    >
      GAMBITI
    </Link>
  );
}
