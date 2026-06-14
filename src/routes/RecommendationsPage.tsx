import { Link, useSearchParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';
import { GameGridSection } from '@/features/main/components/GameGridSection';
import { GuestRecommendations } from '@/features/recommendations/components/GuestRecommendations';
import {
  RECOMMENDATION_PAGE_SIZE,
  type DiscountedRecommendation,
  type HighlyRatedRecommendation,
  type LatestRecommendation,
  type PopularGame,
} from '@/features/recommendations/api/recommendations';
import {
  DiscountedRecommendationCard,
  HighlyRatedRecommendationCard,
  LatestRecommendationCard,
  PopularGameCard,
} from '@/features/recommendations/components/RecommendationCards';
import { RecommendationHero } from '@/features/recommendations/components/RecommendationHero';
import {
  useDiscountedRecommendations,
  useHighlyRatedRecommendations,
  useLatestRecommendations,
  usePopularGames,
} from '@/features/recommendations/hooks/useRecommendations';
import { useAuthStore } from '@/lib/store/useAuthStore';

const cardLink = css({
  display: 'block',
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: 'xl',
  _focusVisible: {
    outline: '2px solid',
    outlineColor: 'accent.default',
    outlineOffset: '2px',
  },
});

const recommendationTabs = [
  { id: 'personalized', label: 'GamBTI 추천' },
  { id: 'discounted', label: '할인 중' },
  { id: 'highly-rated', label: '유저 고평가' },
  { id: 'popular', label: '인기 게임' },
] as const;

type RecommendationTab = (typeof recommendationTabs)[number]['id'];

const tabStyles = {
  container: css({ pt: '10' }),
  list: css({
    display: 'flex',
    gap: '2',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    overflowX: 'auto',
    overflowY: 'hidden',
  }),
  tab: css({
    position: 'relative',
    flexShrink: 0,
    px: '5',
    py: '3.5',
    border: 0,
    bg: 'transparent',
    color: 'fg.muted',
    fontSize: 'md',
    fontWeight: 'medium',
    cursor: 'pointer',
    _hover: { color: 'fg.default' },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'accent.default',
      outlineOffset: '-2px',
    },
    _after: {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '-1px',
      h: '0.5',
      bg: 'transparent',
    },
    '&[aria-selected="true"]': {
      color: 'accent.default',
      fontWeight: 'bold',
      _after: { bg: 'accent.default' },
    },
  }),
};

function isRecommendationTab(value: string | null): value is RecommendationTab {
  return recommendationTabs.some((tab) => tab.id === value);
}

export function RecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const hasCompletedSurvey = useAuthStore(
    (s) => s.user?.hasCompletedSurvey ?? false,
  );
  const showPersonalized = status === 'authenticated' && hasCompletedSurvey;

  const latest = useLatestRecommendations({ enabled: showPersonalized });
  const discounted = useDiscountedRecommendations({
    enabled: showPersonalized,
  });
  const highlyRated = useHighlyRatedRecommendations({
    enabled: showPersonalized,
  });
  const popular = usePopularGames({ enabled: showPersonalized });
  const category = searchParams.get('category');
  const activeTab: RecommendationTab = isRecommendationTab(category)
    ? category
    : 'personalized';

  const selectTab = (tab: RecommendationTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === 'personalized') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', tab);
    }
    setSearchParams(nextParams);
  };

  if (!showPersonalized) {
    return (
      <main
        className={css({ flex: '1', display: 'flex', flexDirection: 'column' })}
      >
        <GuestRecommendations isAuthenticated={status === 'authenticated'} />
      </main>
    );
  }

  return (
    <main
      className={css({ flex: '1', display: 'flex', flexDirection: 'column' })}
    >
      <RecommendationHero />
      <PageContainer className={tabStyles.container}>
        <div className={tabStyles.list} role="tablist" aria-label="추천 분류">
          {recommendationTabs.map((tab) => (
            <button
              key={tab.id}
              id={`recommendation-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`recommendation-panel-${tab.id}`}
              className={tabStyles.tab}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </PageContainer>

      <div
        id="recommendation-panel-personalized"
        role="tabpanel"
        aria-labelledby="recommendation-tab-personalized"
        hidden={activeTab !== 'personalized'}
      >
        <GameGridSection<LatestRecommendation>
          title="GamBTI 추천 게임"
          items={latest.data ?? []}
          isLoading={latest.isLoading}
          isError={latest.isError}
          errorText="추천 게임을 불러오지 못했어요."
          emptyText="아직 추천 게임이 없어요."
          pageSize={RECOMMENDATION_PAGE_SIZE}
          persistMoreButton
          renderCard={(item) => (
            <Link
              key={item.recommendationItemId}
              to={`/games/${item.gameId}`}
              className={cardLink}
            >
              <LatestRecommendationCard game={item} />
            </Link>
          )}
        />
      </div>

      <div
        id="recommendation-panel-discounted"
        role="tabpanel"
        aria-labelledby="recommendation-tab-discounted"
        hidden={activeTab !== 'discounted'}
      >
        <GameGridSection<DiscountedRecommendation>
          title="할인 중인 취향 저격 게임"
          items={discounted.data ?? []}
          isLoading={discounted.isLoading}
          isError={discounted.isError}
          errorText="세일 게임을 불러오지 못했어요."
          emptyText="현재 세일 중인 맞춤 게임이 없어요."
          pageSize={RECOMMENDATION_PAGE_SIZE}
          persistMoreButton
          renderCard={(item) => (
            <Link
              key={item.recommendationItemId}
              to={`/games/${item.gameId}`}
              className={cardLink}
            >
              <DiscountedRecommendationCard game={item} />
            </Link>
          )}
        />
      </div>

      <div
        id="recommendation-panel-highly-rated"
        role="tabpanel"
        aria-labelledby="recommendation-tab-highly-rated"
        hidden={activeTab !== 'highly-rated'}
      >
        <GameGridSection<HighlyRatedRecommendation>
          title="유저들이 인정한 취향 게임"
          items={highlyRated.data ?? []}
          isLoading={highlyRated.isLoading}
          isError={highlyRated.isError}
          errorText="추천 게임을 불러오지 못했어요."
          emptyText="평가 좋은 맞춤 게임이 없어요."
          pageSize={RECOMMENDATION_PAGE_SIZE}
          persistMoreButton
          renderCard={(item) => (
            <Link
              key={item.recommendationItemId}
              to={`/games/${item.gameId}`}
              className={cardLink}
            >
              <HighlyRatedRecommendationCard game={item} />
            </Link>
          )}
        />
      </div>

      <div
        id="recommendation-panel-popular"
        role="tabpanel"
        aria-labelledby="recommendation-tab-popular"
        hidden={activeTab !== 'popular'}
      >
        <GameGridSection<PopularGame>
          title="지금 가장 핫한 게임"
          items={popular.data ?? []}
          isLoading={popular.isLoading}
          isError={popular.isError}
          errorText="인기 게임을 불러오지 못했어요."
          emptyText="인기 게임이 없어요."
          pageSize={RECOMMENDATION_PAGE_SIZE}
          persistMoreButton
          renderCard={(item) => (
            <Link
              key={item.gameId}
              to={`/games/${item.gameId}`}
              className={cardLink}
            >
              <PopularGameCard game={item} />
            </Link>
          )}
        />
      </div>
    </main>
  );
}
