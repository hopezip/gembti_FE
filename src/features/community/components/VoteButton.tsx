import { useState } from 'react';
import { css } from 'styled-system/css';

interface VoteButtonProps {
  count: number;
  voted?: boolean;
  onToggle?: (voted: boolean) => void;
}

// 원형 ♥ 버튼 + 투표 수. voted=true → danger.fg bg, false → border.default
export function VoteButton({
  count,
  voted = false,
  onToggle,
}: VoteButtonProps) {
  const [isVoted, setIsVoted] = useState(voted);
  const [localCount, setLocalCount] = useState(count);

  function handleToggle() {
    const next = !isVoted;
    setIsVoted(next);
    setLocalCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    onToggle?.(next);
  }

  return (
    <div
      className={css({
        w: '44px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5',
        pt: '0.5',
      })}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isVoted ? '좋아요 취소' : '좋아요'}
        aria-pressed={isVoted}
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          w: '28px',
          h: '28px',
          borderRadius: 'full',
          border: '1px solid',
          borderColor: isVoted ? 'danger.fg' : 'border.default',
          bg: isVoted ? 'danger.fg' : 'transparent',
          color: isVoted ? 'fg.onAccent' : 'fg.subtle',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all {durations.fast}',
          flexShrink: 0,
          _hover: {
            borderColor: isVoted ? 'danger.fg' : 'border.emphasized',
          },
        })}
      >
        ♥
      </button>
      <span
        className={css({
          fontFamily: 'mono',
          fontSize: '11.5px',
          color: 'fg.muted',
          lineHeight: '1.2',
          textAlign: 'center',
        })}
      >
        {localCount === 0 ? '—' : localCount}
      </span>
    </div>
  );
}
