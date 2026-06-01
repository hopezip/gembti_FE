import { css } from 'styled-system/css';
import { LogoMark } from './Logo';

// 글로벌 셸 푸터 (DESIGN_SYSTEM 4.1 + Figma g-footer).
// 레이아웃: [G 마크 + GAMBITI 워드마크(muted) · © 2026 GAMBITI] ...(spacer)... [⚙ 설정 버튼]
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
          display: 'flex',
          alignItems: 'center',
          gap: '4',
        })}
      >
        {/* 로고: G 마크(accent) + 워드마크(muted). 헤더 로고와 동일 서체, 푸터는 fg.subtle 톤. */}
        <span
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            fontFamily: 'display',
            fontStyle: 'italic',
            letterSpacing: 'widest',
            textTransform: 'uppercase',
            fontSize: 'sm',
            color: 'fg.subtle',
            whiteSpace: 'nowrap',
          })}
        >
          <LogoMark />
          GAMBITI
        </span>
        {/* 저작권 캡션 = mono · fontSize xs · fg.subtle (Figma g-footer "© 2026 GAMBITI"). */}
        <span className={css({ textStyle: 'caption', textTransform: 'none' })}>
          © 2026 GAMBITI
        </span>

        {/* spacer — 설정 버튼을 우측 끝으로 민다. */}
        <div className={css({ flex: '1', minW: '0' })} />

        {/* ⚙ 설정 버튼 (Figma g-footer 우측 원형 버튼). 설정 라우트는 MVP 밖 → 후속 연결 예정. */}
        <button
          type="button"
          aria-label="설정"
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '8',
            h: '8',
            flexShrink: 0,
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'border.emphasized',
            bg: 'transparent',
            color: 'fg.muted',
            cursor: 'pointer',
            transition: 'color {durations.fast}, border-color {durations.fast}',
            _hover: { color: 'fg.default', borderColor: 'fg.subtle' },
          })}
        >
          ⚙
        </button>
      </div>
    </footer>
  );
}
