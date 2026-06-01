import { css } from 'styled-system/css';
import type { MockGame } from '@/mocks/handlers/games';
import { GameSearchCard } from './GameSearchCard';

interface Props {
  query: string;
  suggestions: string[];
  altGames: MockGame[];
  onSearch: (q: string) => void;
}

export function SearchEmptyState({
  query,
  suggestions,
  altGames,
  onSearch,
}: Props) {
  const suggestion = suggestions[0] ?? '';

  return (
    <div
      className={css({
        py: '12',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8',
      })}
    >
      {/* 상단: 아이콘 + 메시지 */}
      <div
        className={css({
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3',
        })}
      >
        <span className={css({ fontSize: '4xl', lineHeight: '1' })}>🔍</span>
        <p
          className={css({
            fontSize: 'xl',
            fontWeight: 'bold',
            color: 'fg.default',
          })}
        >
          {query && (
            <span className={css({ color: 'accent.fg' })}>"{query}"</span>
          )}
          {query ? '에 해당하는 게임이 없어요' : '검색 결과가 없어요'}
        </p>
        <p
          className={css({ fontSize: 'sm', color: 'fg.muted', maxW: '480px' })}
        >
          대신 비슷한 취향에 맞는 게임을 골라봤어요. 필터를 조정하거나 아래 추천
          게임을 둘러보세요.
        </p>
      </div>

      {/* 재검색 입력 */}
      {suggestion && (
        <div
          className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
        >
          <button
            type="button"
            onClick={() => onSearch(suggestion)}
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2',
              bg: 'bg.surface',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 'full',
              px: '4',
              py: '2',
              fontSize: 'sm',
              color: 'fg.muted',
              cursor: 'pointer',
              minW: '200px',
              _hover: { borderColor: 'border.emphasized' },
            })}
          >
            <span className={css({ color: 'fg.subtle', fontSize: 'xs' })}>
              ●
            </span>
            {suggestion}
          </button>
          <button
            type="button"
            onClick={() => onSearch(suggestion)}
            className={css({
              bg: 'accent.default',
              color: 'fg.onAccent',
              border: 'none',
              borderRadius: 'md',
              px: '4',
              py: '2',
              fontSize: 'sm',
              fontWeight: 'semibold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              _hover: { opacity: '0.9' },
            })}
          >
            검색하기
          </button>
        </div>
      )}

      {/* 대체 추천 게임 */}
      {altGames.length > 0 && (
        <div className={css({ w: 'full' })}>
          <p
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'fg.default',
              mb: '4',
            })}
          >
            대신 이런 게임은 어떠세요?
          </p>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4',
            })}
          >
            {altGames.slice(0, 4).map((game) => (
              <GameSearchCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
