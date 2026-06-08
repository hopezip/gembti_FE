import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { Card } from '@/components/ui/GameCard';
import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';

// 설문 결과 기반 추천 게임. 상세 이동을 위해 id는 /games/:id에 사용한다.
export interface RecommendedGame {
  id: number;
  title: string;
  genres: string[];
  thumbnailUrl: string;
  reason: string;
}

interface GameRecommendationsProps {
  games: RecommendedGame[];
}

// 설문 결과 하단 추천 게임 목록. 공통 GameSummaryCard를 재사용한다.
export function GameRecommendations({ games }: GameRecommendationsProps) {
  return (
    <section
      className={css({ mt: { base: '10', md: '14' } })}
      aria-labelledby="recommended-games"
    >
      <Card
        padding="none"
        className={css({
          bg: 'bg.subtle',
          borderColor: 'border.emphasized',
          p: { base: '5', md: '7' },
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2.5',
            mb: { base: '6', md: '8' },
          })}
        >
          <Star
            className={css({
              w: '5',
              h: '5',
              color: 'accent.default',
              fill: 'accent.default',
              flexShrink: 0,
            })}
            aria-hidden
          />
          <h2
            className={css({
              m: '0',
              color: 'fg.default',
              fontSize: { base: '2xl', md: '3xl' },
              fontWeight: 'bold',
              lineHeight: 'tight',
            })}
            id="recommended-games"
          >
            당신의 성향에 맞는 일차 추천
          </h2>
        </div>

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: {
              base: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { base: '6', lg: '7' },
          })}
        >
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className={css({
                display: 'block',
                color: 'inherit',
                textDecoration: 'none',
                borderRadius: 'xl',
                transition: 'transform 0.15s ease',
                _hover: { transform: 'translateY(-2px)' },
                _focusVisible: {
                  outline: '2px solid',
                  outlineColor: 'accent.default',
                  outlineOffset: '3px',
                },
              })}
            >
              <GameSummaryCard
                title={game.title}
                genres={game.genres}
                rating={null}
                thumbnailUrl={game.thumbnailUrl}
              />
              <p
                className={css({
                  mt: '2.5',
                  color: 'accent.default',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                })}
              >
                {game.reason}
              </p>
            </Link>
          ))}
        </div>

        <p
          className={css({
            m: '0',
            mt: { base: '7', md: '9' },
            color: 'fg.subtle',
            fontSize: 'sm',
            textAlign: 'center',
          })}
        >
          추천 결과는 참고용이며, 플레이 기록에 따라 더 정교해질 수 있어요.
        </p>
      </Card>
    </section>
  );
}
