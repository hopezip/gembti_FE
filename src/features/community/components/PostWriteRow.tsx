import { css } from 'styled-system/css';

interface WriteAction {
  key: string;
  icon: string;
  label: string;
  sub: string;
  tone: 'accent' | 'success';
}

const WRITE_ACTIONS: WriteAction[] = [
  {
    key: 'write',
    icon: '✎',
    label: '글쓰기',
    sub: '자유 · 공략 · 스크린샷',
    tone: 'accent',
  },
  {
    key: 'review',
    icon: '★',
    label: '리뷰 작성',
    sub: 'COMM004 사후 리뷰',
    tone: 'accent',
  },
  {
    key: 'party',
    icon: '⚔',
    label: '파티 모집',
    sub: 'COMM002 게임/시간/모드/인원',
    tone: 'success',
  },
];

// 글쓰기 빠른 진입 행 (Figma: write-row, h=65px).
// 3개 카드 균등 배치: 글쓰기(주황) / 리뷰 작성(주황) / 파티 모집(초록).
export function PostWriteRow() {
  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '3',
      })}
    >
      {WRITE_ACTIONS.map(({ key, icon, label, sub, tone }) => (
        <button
          key={key}
          type="button"
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            h: '65px',
            px: '4',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color {durations.base}',
            _hover: { borderColor: 'border.emphasized' },
          })}
        >
          {/* 아이콘 원형 배경 */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              w: '32px',
              h: '32px',
              borderRadius: 'full',
              bg: tone === 'accent' ? 'accent.soft' : 'success.soft',
              fontSize: '16px',
              color: tone === 'accent' ? 'accent.fg' : 'success.fg',
            })}
            aria-hidden="true"
          >
            {icon}
          </div>

          {/* 텍스트 */}
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '1',
            })}
          >
            <span
              className={css({
                fontSize: '13.5px',
                color: 'fg.default',
                lineHeight: '1.2',
              })}
            >
              {label}
            </span>
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: '11px',
                color: 'fg.subtle',
                lineHeight: '1.2',
              })}
            >
              {sub}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
