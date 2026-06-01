import { css } from 'styled-system/css';
import { LogoMark } from './Logo';

// GitHub 마크 아이콘 — 푸터 우측 원형 버튼 (Figma g-footer).
// aria-hidden: 부모 button의 aria-label이 접근명을 전달.
function GitHubIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.378.203 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

// 글로벌 셸 푸터 (DESIGN_SYSTEM 4.1 + Figma g-footer).
// 레이아웃: [G 마크 + GAMBITI 워드마크(muted) · © 2026 GAMBITI] ...(spacer)... [GitHub 원형 버튼]
// h=81px 고정, 데스크탑 전용 다크 모드. 색은 semantic token만.
export function Footer() {
  return (
    <footer
      className={css({
        h: '81px',
        display: 'flex',
        alignItems: 'center',
        borderTop: '1px solid',
        borderColor: 'border.default',
        bg: 'bg.canvas',
        px: { base: '7', '2xl': '8' },
      })}
    >
      <div
        className={css({
          w: 'full',
          display: 'flex',
          alignItems: 'center',
          gap: '4',
        })}
      >
        {/* 로고: G 마크 + 워드마크(dim). 헤더 로고와 동일 서체, 푸터는 fg.subtle 톤. */}
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
        {/* 저작권 캡션 (Figma g-footer "© 2026 GAMBITI"). */}
        <span className={css({ textStyle: 'caption', textTransform: 'none' })}>
          © 2026 GAMBITI
        </span>

        {/* spacer — GitHub 버튼을 우측 끝으로 민다. */}
        <div className={css({ flex: '1', minW: '0' })} />

        {/* GitHub 버튼 (Figma g-footer 우측 원형 버튼). */}
        <a
          href="https://github.com/hopezip/gembti_FE"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 저장소"
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
            textDecoration: 'none',
            transition: 'color {durations.fast}, border-color {durations.fast}',
            _hover: { color: 'fg.default', borderColor: 'fg.subtle' },
          })}
        >
          <GitHubIcon />
        </a>
      </div>
    </footer>
  );
}
