import { Link, useParams } from 'react-router-dom';
import { css } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  type GameSummaryItem,
  useGameDetail,
} from '@/features/game/api/gameDetail';
import { GameDetailHero } from '@/features/game/components/GameDetailHero';
import { GameInfoTable } from '@/features/game/components/GameInfoTable';
import { GameIntroSection } from '@/features/game/components/GameIntroSection';
import { GameMediaGallery } from '@/features/game/components/GameMediaGallery';
import { GameSummaryCard } from '@/features/game/components/GameSummaryCard';
import { GameGridSection } from '@/features/main/components/GameGridSection';

// 게임 상세 페이지 (REC-DET-FE-001, 라우트 '/games/:gameId'·Public).
// 앞 단계 산출물(gameDetail.ts·Hero·IntroSection·InfoTable·MediaGallery·GameGridSection)을 조립한다.
// 조립 순서(위→아래): Hero → 게임 소개 → 정보 테이블 → 미디어 → 유사 게임 → 개발사의 다른 게임.
// 카드 섹션 2개는 공유 GameGridSection을 pageSize 4로 재사용하고, 각 카드를 /games/:id Link로 감싼다.
// GlobalShell은 라우트 레벨에서 자동 적용되므로 여기서 렌더하지 않는다(<main> landmark만 페이지가 소유).
// 새 쿼리는 신설하지 않는다 — useGameDetail 훅 하나로 상세 1건을 구독한다.

const styles = {
  // 상태 안내(로딩/에러/없음) 중앙 박스 — 위아래 넉넉히.
  stateBox: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '4',
    py: '20',
  }),
  stateTitle: css({ textStyle: 'heading.h3', color: 'fg.default' }),
  stateDesc: css({ textStyle: 'body.md', color: 'fg.muted', maxW: '480px' }),
  // 로딩 스켈레톤 — 상세 진입 직후 빈 화면 대신 surfaceRaised 블록을 노출한다.
  heroSkeleton: css({
    bg: 'bg.surfaceRaised',
    borderRadius: 'xl',
    h: '320px',
    opacity: '0.5',
  }),
  bodySkeleton: css({
    bg: 'bg.surfaceRaised',
    borderRadius: 'xl',
    h: '180px',
    opacity: '0.5',
    mt: '8',
  }),
  // 본문 섹션 사이 세로 간격(소개·정보·미디어). 카드 섹션은 자체 py를 가진다.
  body: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '12', // 섹션 간 48px
    py: '12',
  }),
  // 카드 링크 — SearchPage와 동일 패턴(블록 링크 + hover lift + 포커스 링).
  cardLink: css({
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
  }),
};

// 유사 게임·개발사 게임 카드 1장 — /games/:id Link로 감싼 GameSummaryCard.
// GameGridSection의 renderCard에 그대로 넘긴다(key는 호출부에서 이 컴포넌트에 부여).
function SummaryCardLink({ item }: { item: GameSummaryItem }) {
  return (
    <Link to={`/games/${item.gameId}`} className={styles.cardLink}>
      <GameSummaryCard
        title={item.title}
        genres={item.genres}
        rating={item.rating}
        thumbnailUrl={item.thumbnailUrl || undefined}
      />
    </Link>
  );
}

export default function GameDetailPage() {
  // 라우트 파라미터(문자열) → 숫자. NaN/<=0이면 useGameDetail의 enabled 가드로 요청이 나가지 않는다.
  const { gameId } = useParams();
  const numericId = Number(gameId);
  const isValidId = Number.isFinite(numericId) && numericId > 0;

  const { data, isLoading, isError } = useGameDetail(numericId);

  // 잘못된 id(NaN·0·음수)는 즉시 "찾을 수 없음" 안내(요청 미발생).
  if (!isValidId) {
    return (
      <main>
        <PageContainer>
          <div className={styles.stateBox}>
            <h1 className={styles.stateTitle}>게임을 찾을 수 없어요</h1>
            <p className={styles.stateDesc}>
              올바르지 않은 게임 주소예요. 주소를 다시 확인해 주세요.
            </p>
          </div>
        </PageContainer>
      </main>
    );
  }

  // 로딩 — Hero/본문 자리에 스켈레톤 블록을 노출한다.
  if (isLoading) {
    return (
      <main>
        <PageContainer className={css({ py: '12' })}>
          <div className={styles.heroSkeleton} />
          <div className={styles.bodySkeleton} />
        </PageContainer>
      </main>
    );
  }

  // 에러(404 포함) / 데이터 없음 — 공통 "찾을 수 없음" 안내.
  if (isError || !data) {
    return (
      <main>
        <PageContainer>
          <div className={styles.stateBox}>
            <h1 className={styles.stateTitle}>게임을 찾을 수 없어요</h1>
            <p className={styles.stateDesc}>
              요청하신 게임 정보를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.
            </p>
          </div>
        </PageContainer>
      </main>
    );
  }

  return (
    <main>
      {/* Hero — 자체 풀블리드 배경 + 내부 PageContainer 정렬(이중 래핑 금지). */}
      <GameDetailHero detail={data} />

      {/* 소개 · 정보 · 미디어 — 폭/거터 정렬을 위해 PageContainer로 감싼다. */}
      <PageContainer className={styles.body}>
        <GameIntroSection
          description={data.description}
          fullDescription={data.fullDescription}
        />
        <GameInfoTable detail={data} />
        <GameMediaGallery
          screenshotUrls={data.screenshotUrls}
          trailerUrl={data.trailerUrl}
        />
      </PageContainer>

      {/* 카드 섹션 2개 — GameGridSection이 내부에서 PageContainer를 감싸므로 또 감싸지 않는다. */}
      <GameGridSection<GameSummaryItem>
        title="이 게임을 좋아하는 사람이 본 다른 게임"
        items={data.similarGames}
        isLoading={false}
        isError={false}
        pageSize={4}
        errorText="유사 게임을 불러오지 못했어요."
        emptyText="표시할 유사 게임이 없어요."
        renderCard={(item) => <SummaryCardLink key={item.gameId} item={item} />}
      />

      <GameGridSection<GameSummaryItem>
        title="같은 개발사의 게임"
        items={data.developerGames}
        isLoading={false}
        isError={false}
        pageSize={4}
        errorText="개발사의 게임을 불러오지 못했어요."
        emptyText="표시할 개발사의 게임이 없어요."
        renderCard={(item) => <SummaryCardLink key={item.gameId} item={item} />}
      />
    </main>
  );
}
