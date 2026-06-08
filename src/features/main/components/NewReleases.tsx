import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { useGuestHome } from '@/features/main/api/guestHome';
import { GameGridSection } from '@/features/main/components/GameGridSection';

// MAIN-FE-004 비로그인 "이번 주 신규 게임" 섹션.
// 데이터 출처는 guest-home의 newReleases. 메인 1페이지=1쿼리이므로 useGuestHome를 재사용한다(새 쿼리 0).
// 그리드/스켈레톤/4상태/더보기는 공유 GameGridSection이 소유하고, 여기선 데이터·카드만 전달한다.
// 각 카드는 /games/:id 상세로 가는 react-router Link로 감싼다(REC-DET-FE-001 진입점 보강).

// 카드 링크 — SearchPage/상세와 동일 패턴(블록 링크 + hover lift + 포커스 링).
const cardLink = css({
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
  borderRadius: 'xl',
  transition: 'transform 0.15s ease',
  _hover: { transform: 'translateY(-2px)' },
  _focusVisible: {
    outline: '2px solid',
    outlineColor: 'accent.default',
    outlineOffset: '2px',
  },
});

export function NewReleases() {
  const { data, isLoading, isError } = useGuestHome();

  return (
    <GameGridSection
      title="이번 주 신규 게임"
      items={data?.newReleases ?? []}
      isLoading={isLoading}
      isError={isError}
      errorText="신규 게임을 불러오지 못했어요."
      emptyText="표시할 신규 게임이 없어요."
      renderCard={(game) => (
        // "신규 게임" 섹션이므로 데이터 isNew 유무와 무관하게 항상 NEW 뱃지 표시(섹션 자체가 곧 신규).
        <Link
          key={game.gameId}
          to={`/games/${game.gameId}`}
          className={cardLink}
        >
          <GameSummaryCard
            title={game.title}
            thumbnailUrl={game.thumbnailUrl}
            genres={game.genres}
            rating={game.rating}
            isNew
          />
        </Link>
      )}
    />
  );
}
