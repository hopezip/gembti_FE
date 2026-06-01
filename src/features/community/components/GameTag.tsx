import { css } from 'styled-system/css';

interface GameTagProps {
  gameName: string;
}

// 주황 점(5px) + 게임명 텍스트 (Figma: game tag in bottom-meta)
export function GameTag({ gameName }: GameTagProps) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '1.5',
        flexShrink: 0,
      })}
    >
      <div
        className={css({
          w: '5px',
          h: '5px',
          borderRadius: 'full',
          bg: 'accent.default',
          flexShrink: 0,
        })}
      />
      <span
        className={css({
          fontFamily: 'mono',
          fontSize: '11.5px',
          color: 'fg.muted',
          lineHeight: '1.2',
          whiteSpace: 'nowrap',
        })}
      >
        {gameName}
      </span>
    </div>
  );
}
