import { css } from 'styled-system/css';

// 글로벌 셸 푸터 (DESIGN_SYSTEM 4.1: border-top, fg.subtle 12.5 캡션).
// 데스크탑 전용 다크 모드. 색은 semantic token만, 신규 토큰/recipe 없음.
export function Footer() {
  return (
    <footer
      className={css({
        borderTop: '1px solid',
        borderColor: 'border.default',
        bg: 'bg.canvas',
        // 콘텐츠 컨테이너와 동일한 가로 정렬(max-w containerLg + 좌우 패딩).
        px: { base: '7', '2xl': '8' },
        py: '6',
      })}
    >
      <div
        className={css({
          maxW: 'containerLg',
          mx: 'auto',
          // caption = mono · fontSize xs · fg.subtle (DESIGN_SYSTEM 4.1 푸터 캡션).
          textStyle: 'caption',
          textTransform: 'none',
        })}
      >
        © 2026 GAMBITI · 게임 유저를 위한 AI 게임 추천 서비스
      </div>
    </footer>
  );
}
