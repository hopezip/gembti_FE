import { Link, useSearchParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';
import { GameGridSection } from '@/features/main/components/GameGridSection';
import {
  RECOMMENDATION_PAGE_SIZE,
  type DiscountedRecommendation,
  type HighlyRatedRecommendation,
  type LatestRecommendation,
  type PopularGame,
} from '@/features/recommendations/api/recommendations';
import { GuestRecommendations } from '@/features/recommendations/components/GuestRecommendations';
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

const tabs = [
  { id: 'personalized', label: 'GamBTI 추천', mobileLabel: '추천' },
  { id: 'discounted', label: '할인 중', mobileLabel: '할인' },
  { id: 'highly-rated', label: '유저 고평가', mobileLabel: '고평가' },
  { id: 'popular', label: '인기 게임', mobileLabel: '인기' },
] as const;

type TabId = (typeof tabs)[number]['id'];
type RecommendationItem =
  | LatestRecommendation
  | DiscountedRecommendation
  | HighlyRatedRecommendation
  | PopularGame;

const gridCopy: Record<
  TabId,
  { title: string; errorText: string; emptyText: string }
> = {
  personalized: {
    title: 'GamBTI 추천 게임',
    errorText: '추천 게임을 불러오지 못했어요.',
    emptyText: '아직 맞춤 추천 게임이 없어요. 잠시 후 다시 시도해 주세요.',
  },
  discounted: {
    title: '할인 중인 취향 저격 게임',
    errorText: '세일 게임을 불러오지 못했어요.',
    emptyText: '지금은 취향 맞춤 게임 중 세일 중인 게임이 없어요.',
  },
  'highly-rated': {
    title: '유저들이 인정한 취향 게임',
    errorText: '추천 게임을 불러오지 못했어요.',
    emptyText: '지금은 취향 맞춤 게임 중 고평가 게임이 없어요.',
  },
  popular: {
    title: '지금 가장 핫한 게임',
    errorText: '인기 게임을 불러오지 못했어요.',
    emptyText: '지금은 취향 맞춤 인기 게임이 없어요.',
  },
};

const styles = {
  page: css({ flex: '1', display: 'flex', flexDirection: 'column' }),
  tabs: css({ py: '8' }),
  tabList: css({
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: 'border.default',
  }),
  tab: css({
    position: 'relative',
    flex: { base: '1 1 25%', sm: '0 0 auto' },
    minW: 0,
    px: { base: '1', sm: '5' },
    py: { base: '3', sm: '3.5' },
    border: 0,
    bg: 'transparent',
    color: 'fg.muted',
    fontSize: { base: 'sm', sm: 'md' },
    fontWeight: 'medium',
    whiteSpace: 'nowrap',
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
      insetInline: 0,
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
  desktopLabel: css({ display: { base: 'none', sm: 'inline' } }),
  mobileLabel: css({ display: { base: 'inline', sm: 'none' } }),
  cardLink: css({
    display: 'block',
    color: 'inherit',
    textDecoration: 'none',
    borderRadius: 'xl',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'accent.default',
      outlineOffset: '2px',
    },
  }),
};

function isTab(value: string | null): value is TabId {
  return tabs.some((tab) => tab.id === value);
}

function renderCard(tab: TabId, item: RecommendationItem) {
  const card =
    tab === 'personalized' ? (
      <LatestRecommendationCard game={item as LatestRecommendation} />
    ) : tab === 'discounted' ? (
      <DiscountedRecommendationCard game={item as DiscountedRecommendation} />
    ) : tab === 'highly-rated' ? (
      <HighlyRatedRecommendationCard game={item as HighlyRatedRecommendation} />
    ) : (
      <PopularGameCard game={item as PopularGame} />
    );

  return (
    <Link
      key={item.gameId}
      to={`/games/${item.gameId}`}
      className={styles.cardLink}
    >
      {card}
    </Link>
  );
}

export function RecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = useAuthStore((state) => state.status);
  const hasCompletedSurvey = useAuthStore(
    (state) => state.user?.hasCompletedSurvey ?? false,
  );
  const showPersonalized = status === 'authenticated' && hasCompletedSurvey;
  const category = searchParams.get('category');
  const activeTab: TabId = isTab(category) ? category : 'personalized';
  const queries = {
    personalized: useLatestRecommendations({ enabled: showPersonalized }),
    discounted: useDiscountedRecommendations({ enabled: showPersonalized }),
    'highly-rated': useHighlyRatedRecommendations({
      enabled: showPersonalized,
    }),
    popular: usePopularGames({ enabled: showPersonalized }),
  };

  const selectTab = (id: TabId) => {
    const next = new URLSearchParams(searchParams);
    id === 'personalized' ? next.delete('category') : next.set('category', id);
    setSearchParams(next);
  };

  if (!showPersonalized) {
    return (
      <main className={styles.page}>
        <GuestRecommendations isAuthenticated={status === 'authenticated'} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <RecommendationHero />
      <PageContainer className={styles.tabs}>
        <div className={styles.tabList} role="tablist" aria-label="추천 분류">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`recommendation-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-label={tab.label}
              aria-selected={activeTab === tab.id}
              aria-controls={`recommendation-panel-${tab.id}`}
              className={styles.tab}
              onClick={() => selectTab(tab.id)}
            >
              <span className={styles.desktopLabel}>{tab.label}</span>
              <span className={styles.mobileLabel}>{tab.mobileLabel}</span>
            </button>
          ))}
        </div>
      </PageContainer>

      {tabs.map(({ id }) => {
        const query = queries[id];
        return (
          <div
            key={id}
            id={`recommendation-panel-${id}`}
            role="tabpanel"
            aria-labelledby={`recommendation-tab-${id}`}
            hidden={activeTab !== id}
          >
            <GameGridSection<RecommendationItem>
              {...gridCopy[id]}
              items={(query.data ?? []) as RecommendationItem[]}
              isLoading={query.isLoading}
              isError={query.isError}
              pageSize={RECOMMENDATION_PAGE_SIZE}
              persistMoreButton
              flushTop
              renderCard={(item) => renderCard(id, item)}
            />
          </div>
        );
      })}
    </main>
  );
}
