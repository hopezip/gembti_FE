import { css } from 'styled-system/css';
import { GameCard } from '@/components/ui/GameCard';
import type { MockGame } from '@/mocks/handlers/games';

interface Props {
  game: MockGame;
}

export function GameSearchCard({ game }: Props) {
  return (
    <GameCard padding="none" interactive>
      {/* 커버 플레이스홀더 */}
      <div
        className={css({
          aspectRatio: '16/10',
          bg: 'bg.surfaceRaised',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 'xl',
          borderTopRightRadius: 'xl',
          color: 'fg.subtle',
          fontSize: 'xs',
          overflow: 'hidden',
        })}
      >
        카버쥬얼
      </div>

      {/* 게임 정보 */}
      <div className={css({ px: '3', pt: '2.5', pb: '3' })}>
        <p
          className={css({
            fontWeight: 'semibold',
            color: 'fg.default',
            fontSize: 'sm',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            mb: '1',
          })}
        >
          {game.title}
        </p>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2',
          })}
        >
          <span
            className={css({
              fontSize: 'xs',
              color: 'fg.muted',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            })}
          >
            {game.genres.slice(0, 2).join(' · ')}
          </span>
          {game.rating != null && (
            <span
              className={css({
                fontSize: 'xs',
                color: 'warning.fg',
                fontWeight: 'semibold',
                flexShrink: 0,
              })}
            >
              ★ {game.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </GameCard>
  );
}
