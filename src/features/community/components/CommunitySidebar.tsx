import { css } from 'styled-system/css';

// ─── 공통 스타일 ────────────────────────────────────────────────────────────

const sideCard = css({
  w: '280px',
  bg: 'bg.surface',
  border: '1px solid',
  borderColor: 'border.default',
  borderRadius: 'xl',
  overflow: 'hidden',
  flexShrink: 0,
});

const cardHead = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: '4',
  pt: '4',
  pb: '3',
});

const headLabel = css({
  fontFamily: 'mono',
  fontWeight: 'bold',
  fontSize: 'xs',
  letterSpacing: 'wider',
  color: 'fg.subtle',
});

const headLink = css({
  fontFamily: 'mono',
  fontSize: 'xs',
  color: 'accent.fg',
  cursor: 'pointer',
  textDecoration: 'none',
  _hover: { color: 'accent.hover' },
});

const rankItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  px: '4',
  h: '34px',
  borderBottom: '1px solid',
  borderColor: 'border.default',
  _last: { borderBottom: 'none' },
});

// ─── PopularTagsCard ────────────────────────────────────────────────────────

const POPULAR_TAGS = [
  { rank: 1, tag: '#오픈월드', count: 214 },
  { rank: 2, tag: '#다크판타지', count: 156 },
  { rank: 3, tag: '#한글화', count: 98 },
  { rank: 4, tag: '#협동', count: 76 },
  { rank: 5, tag: '#인디', count: 62 },
];

function PopularTagsCard() {
  return (
    <div className={sideCard}>
      <div className={cardHead}>
        <span className={headLabel}>🔥 인기 태그</span>
        <span className={headLink}>전체 →</span>
      </div>
      {POPULAR_TAGS.map(({ rank, tag, count }) => (
        <div key={rank} className={rankItem}>
          <span
            className={css({
              fontFamily: 'mono',
              fontWeight: 'bold',
              fontSize: 'xs',
              color: 'accent.fg',
              w: '3',
              flexShrink: 0,
            })}
          >
            {rank}
          </span>
          <span
            className={css({
              fontWeight: 'medium',
              fontSize: 'md',
              color: 'fg.default',
              flex: '1',
              minW: '0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            })}
          >
            {tag}
          </span>
          <span
            className={css({
              fontFamily: 'mono',
              fontSize: 'xs',
              color: 'fg.subtle',
              flexShrink: 0,
            })}
          >
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── ActivePartyCard ────────────────────────────────────────────────────────

const ACTIVE_PARTIES = [
  { title: '게임 타이틀 02 레이드', time: '토 21:00 · 4인 협동', slots: '2/4' },
  { title: '게임 타이틀 05 PvP', time: '일 14:00 · 5인 팀전', slots: '3/5' },
  { title: '게임 타이틀 07 협동', time: '금 22:00 · 2인 코옵', slots: '1/2' },
];

function ActivePartyCard() {
  return (
    <div className={sideCard}>
      <div className={cardHead}>
        <span className={headLabel}>⚔ 활성 파티 모집</span>
        <span className={headLink}>전체 →</span>
      </div>
      {ACTIVE_PARTIES.map(({ title, time, slots }) => (
        <div
          key={title}
          className={css({
            px: '4',
            py: '2.5',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            _last: { borderBottom: 'none' },
          })}
        >
          <p
            className={css({
              fontSize: 'md',
              color: 'fg.default',
              mb: '1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            })}
          >
            {title}
          </p>
          <p
            className={css({
              fontFamily: 'mono',
              fontSize: 'xs',
              color: 'fg.subtle',
            })}
          >
            {time} <span className={css({ color: 'success.fg' })}>{slots}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── ActiveBoardCard ────────────────────────────────────────────────────────

const ACTIVE_BOARDS = [
  { rank: 1, game: '게임 타이틀 01', count: 128 },
  { rank: 2, game: '게임 타이틀 02', count: 94 },
  { rank: 3, game: '게임 타이틀 04', count: 71 },
  { rank: 4, game: '게임 타이틀 03', count: 58 },
  { rank: 5, game: '게임 타이틀 09', count: 43 },
];

function ActiveBoardCard() {
  return (
    <div className={sideCard}>
      <div className={cardHead}>
        <span className={headLabel}>🎮 활성 게임 게시판</span>
        <span className={headLink}>전체 →</span>
      </div>
      {ACTIVE_BOARDS.map(({ rank, game, count }) => (
        <div key={rank} className={rankItem}>
          <span
            className={css({
              fontFamily: 'mono',
              fontWeight: 'bold',
              fontSize: 'xs',
              color: 'accent.fg',
              w: '3',
              flexShrink: 0,
            })}
          >
            {rank}
          </span>
          <span
            className={css({
              fontWeight: 'medium',
              fontSize: 'md',
              color: 'fg.default',
              flex: '1',
              minW: '0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            })}
          >
            {game}
          </span>
          <span
            className={css({
              fontFamily: 'mono',
              fontSize: 'xs',
              color: 'fg.subtle',
              flexShrink: 0,
            })}
          >
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── MyActivityCard ─────────────────────────────────────────────────────────

interface MyActivity {
  posts: number;
  comments: number;
  reviews: number;
}

const MOCK_ACTIVITY: MyActivity = { posts: 12, comments: 47, reviews: 8 };

function MyActivityCard({
  activity = MOCK_ACTIVITY,
}: {
  activity?: MyActivity;
}) {
  const stats = [
    { value: activity.posts, label: '글' },
    { value: activity.comments, label: '댓글' },
    { value: activity.reviews, label: '리뷰' },
  ];

  return (
    <div className={sideCard}>
      <div className={cardHead}>
        <span className={headLabel}>나의 활동</span>
      </div>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          px: '4',
          pb: '4',
        })}
      >
        {stats.map(({ value, label }) => (
          <div
            key={label}
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1',
            })}
          >
            <span
              className={css({
                fontFamily: 'mono',
                fontWeight: 'bold',
                fontSize: '2xl',
                color: 'fg.default',
                lineHeight: 'tight',
              })}
            >
              {value}
            </span>
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: 'xs',
                color: 'fg.subtle',
              })}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CommunitySidebar ────────────────────────────────────────────────────────

// 커뮤니티 우측 고정 사이드바 (Figma side-c, w=280px).
// 4개 카드: 인기 태그 · 활성 파티 · 활성 게임 게시판 · 나의 활동.
// 현재 정적 mock 데이터 사용 — API 연동 시 각 카드에 훅 주입 예정.
export function CommunitySidebar() {
  return (
    <aside
      aria-label="커뮤니티 사이드바"
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '4',
        w: '280px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: '6',
      })}
    >
      <PopularTagsCard />
      <ActivePartyCard />
      <ActiveBoardCard />
      <MyActivityCard />
    </aside>
  );
}
