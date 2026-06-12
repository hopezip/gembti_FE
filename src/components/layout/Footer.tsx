import { GitFork } from 'lucide-react';
import { css } from 'styled-system/css';
import { LogoMark } from './Logo';
import { pageContainer, pageGutter } from './PageContainer';

// 글로벌 셸 푸터 (DESIGN_SYSTEM 4.1 + Figma g-footer).
// 레이아웃: [G 마크 + GAMBITI 워드마크(muted) · © 2026 GAMBITI] ...(spacer)... [⚙ 설정 버튼]
// 다크 모드. 색은 semantic token만, 신규 토큰/recipe 없음.
export function Footer() {
  return (
    <footer
      className={css(pageGutter, {
        borderTop: '1px solid',
        borderColor: 'border.default',
        bg: 'bg.canvas',
        // 콘텐츠 컨테이너와 동일한 가로 정렬(거터는 pageGutter, 폭은 pageContainer).
        pt: '6',
        pb: {
          base: 'calc(64px + env(safe-area-inset-bottom) + 24px)',
          sm: '6',
        },
      })}
    >
      <div
        className={css(pageContainer, {
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

        {/* 프로젝트 저장소로 이동하는 외부 링크. */}
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
          <GitFork size={16} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
