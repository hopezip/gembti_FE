import { css } from 'styled-system/css';

interface MiniGame {
  id: string;
  title: string;
  genre: string;
  rating?: string;
}

const MOCK_GAMES: MiniGame[] = [
  {
    id: '1',
    title: '게임 타이틀 01',
    genre: 'RPG · 오픈월드',
    rating: '★ 4.8',
  },
  { id: '2', title: '게임 타이틀 02', genre: 'RPG · 액션', rating: '★ 4.7' },
  { id: '3', title: '게임 타이틀 03', genre: '어드벤처', rating: '★ 4.6' },
  { id: '4', title: '게임 타이틀 04', genre: 'RPG · 다크판타지' },
  { id: '5', title: '게임 타이틀 05', genre: '액션', rating: '★ 4.5' },
  { id: '6', title: '게임 타이틀 06', genre: 'RPG · 협동' },
];

function MiniGameCard({ game }: { game: MiniGame }) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        flexShrink: 0,
        h: '56px',
        pl: '2.5',
        pr: '3',
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'full',
        cursor: 'pointer',
        transition: 'border-color {durations.base}',
        _hover: { borderColor: 'border.emphasized' },
      })}
    >
      {/* 썸네일 30×30 */}
      <div
        className={css({
          w: '30px',
          h: '30px',
          flexShrink: 0,
          bg: 'bg.surfaceRaised',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: '4px',
        })}
        aria-hidden="true"
      />

      {/* 게임 정보 */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1',
          minW: '0',
        })}
      >
        <span
          className={css({
            fontSize: '13px',
            color: 'fg.default',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
          })}
        >
          {game.title}
        </span>
        <span
          className={css({
            fontFamily: 'mono',
            fontSize: '11px',
            color: 'fg.subtle',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
          })}
        >
          {game.rating ? `${game.genre} · ${game.rating}` : game.genre}
        </span>
      </div>

      {/* + 리뷰 버튼 */}
      <button
        type="button"
        onClick={(e) => e.stopPropagation()}
        className={css({
          flexShrink: 0,
          h: '22px',
          px: '2',
          borderRadius: 'full',
          bg: 'accent.soft',
          border: '1px solid',
          borderColor: 'accent.soft',
          fontFamily: 'mono',
          fontSize: '11px',
          color: 'accent.fg',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          lineHeight: '1',
          _hover: { borderColor: 'accent.default' },
        })}
      >
        ＋ 리뷰
      </button>
    </div>
  );
}

interface GameRecommendStripProps {
  games?: MiniGame[];
}

// 커뮤니티 게임 추천 스트립 (Figma: comm-rec-strip, h≈151px).
// 성향 분석 결과 기반 추천 게임 6개를 가로 스크롤로 표시.
// 정적 mock — API 연동 시 games prop으로 주입.
export function GameRecommendStrip({
  games = MOCK_GAMES,
}: GameRecommendStripProps) {
  return (
    <div
      className={css({
        borderBottom: '1px solid',
        borderColor: 'border.default',
        px: { base: '7', '2xl': '8' },
        pt: '6',
        pb: '5',
      })}
    >
      {/* 헤더 */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'baseline',
          gap: '2',
          mb: '4',
        })}
      >
        <span
          className={css({
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'fg.default',
            lineHeight: '1.2',
          })}
        >
          당신의 성향에 맞는 게임
        </span>
        <span
          className={css({
            fontSize: '10.5px',
            fontWeight: 'bold',
            color: 'fg.default',
            lineHeight: '1.2',
          })}
        >
          예시
        </span>
        <span
          className={css({
            ml: 'auto',
            fontFamily: 'mono',
            fontSize: 'xs',
            color: 'fg.subtle',
            whiteSpace: 'nowrap',
          })}
        >
          클릭 → 해당 게임 게시판으로 이동 · 리뷰 쓰기는 사후 리뷰(COMM004)
        </span>
      </div>

      {/* 가로 스크롤 카드 목록 */}
      <div
        className={css({
          display: 'flex',
          gap: '3',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        })}
      >
        {games.map((game) => (
          <MiniGameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
