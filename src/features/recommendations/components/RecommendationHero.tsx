import { Heart, Star } from 'lucide-react';
import { css } from 'styled-system/css';
import { Tag } from '@/components/ui/Tag';
import { PageContainer } from '@/components/layout/PageContainer';
import { useStatTags } from '@/features/recommendations/api/userStats';
import { useAuthStore } from '@/lib/store/useAuthStore';

// REC-FE-002 게임 추천 페이지 Hero — Figma 게임추천 페이지(node 4003:2288) 기준.
// 구조: 헤드라인(닉네임 + "다음 게임" accent 강조) + 소개 문구
//       + 취향 2그룹(좋아하는 것 / 새로운 도전).
// 데이터 출처: useStatTags → GET /api/v1/stats/me (성향 6축 점수 → liked/challenge 태그 도출).
// 색은 semantic token만, 신규 토큰/recipe 없음. 다크·데스크탑 전용.
// 4상태/항상렌더: 로딩/에러/빈 데이터에서도 헤드라인·메타는 항상 렌더하고,
//   칩·캡션 등 데이터 의존 부분만 조건부 렌더한다(PersonalizedHeroBanner 패턴 동일).

const purple = '#a970ff';
const styles = {
  section: css({ py: { base: '6', md: '8' } }),
  card: css({
    overflow: 'hidden',
    px: { base: '6', md: '8' },
    py: { base: '8', md: '10' },
    bg: 'linear-gradient(120deg, token(colors.bg.surfaceRaised), token(colors.bg.canvas))',
    border: '1px solid',
    borderColor: 'border.emphasized',
    borderRadius: '2xl',
    boxShadow: 'lg',
  }),
  headline: css({
    fontSize: { base: '3xl', md: '5xl' },
    lineHeight: '1.25',
    fontWeight: 'extrabold',
    letterSpacing: '-0.02em',
    color: 'fg.default',
  }),
  headlineBreak: css({ display: 'block' }),
  accentWord: css({ color: 'accent.default' }),
  description: css({
    textStyle: 'body.md',
    color: 'fg.muted',
    mt: '4',
    lineHeight: '1.7',
  }),
  groups: css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', md: '1fr 1px 1fr' },
    alignItems: 'stretch',
    columnGap: { md: '10' },
    rowGap: '8',
    mt: '9',
  }),
  group: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4',
    minW: 0,
  }),
  divider: css({
    display: { base: 'none', md: 'block' },
    w: '1px',
    bg: 'border.default',
  }),
  groupHeading: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
  }),
  likedIcon: css({ color: 'accent.default', flexShrink: 0 }),
  challengeIcon: css({ color: purple, flexShrink: 0 }),
  groupTitle: css({ fontSize: 'xl', fontWeight: 'bold', color: 'fg.default' }),
  chips: css({ display: 'flex', flexWrap: 'wrap', gap: '2' }),
  chip: css({
    px: '4',
    py: '2',
    fontSize: 'md',
    lineHeight: '1',
    fontWeight: 'bold',
    letterSpacing: 'normal',
  }),
  challengeChip: css({ color: purple, borderColor: purple }),
  caption: css({ textStyle: 'body.sm', color: 'fg.muted' }),
};

interface TasteGroupProps {
  title: string;
  tags: string[];
  caption: string;
  challenge?: boolean;
}

function TasteGroup({ title, tags, caption, challenge }: TasteGroupProps) {
  const Icon = challenge ? Star : Heart;
  const iconStyle = challenge ? styles.challengeIcon : styles.likedIcon;

  return (
    <section className={styles.group}>
      <div className={styles.groupHeading}>
        <Icon
          className={iconStyle}
          size={20}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className={styles.groupTitle}>{title}</span>
      </div>
      <div className={styles.chips}>
        {tags.map((label) => (
          <Tag
            key={label}
            tone={challenge ? 'neutral' : 'review'}
            className={`${styles.chip} ${challenge ? styles.challengeChip : ''}`}
          >
            {label}
          </Tag>
        ))}
      </div>
      <span className={styles.caption}>{caption}</span>
    </section>
  );
}

export function RecommendationHero() {
  const { data } = useStatTags();
  // 닉네임은 표시용 — 없으면 '게이머' 폴백(로딩/비로그인 등). status/토큰은 직접 만지지 않는다.
  const nickname = useAuthStore((s) => s.user?.nickname);
  const displayName = nickname ?? '게이머';

  // 데이터 의존부 — 없을 수 있다(로딩/에러/빈). 항상 옵셔널 접근.
  const likedTags = data?.likedTags ?? [];
  const challengeTags = data?.challengeTags ?? [];
  return (
    <PageContainer className={styles.section}>
      <div className={styles.card}>
        <h1 className={styles.headline}>
          {displayName} 님,
          <span className={styles.headlineBreak}>
            당신의 <span className={styles.accentWord}>다음 게임</span>을
            골라봤어요
          </span>
        </h1>

        <p className={styles.description}>
          설문을 기반으로 당신의 취향을 분석했어요.
          <br />
          익숙한 재미는 물론, 새로운 도전까지 준비했어요.
        </p>

        {(likedTags.length > 0 || challengeTags.length > 0) && (
          <div className={styles.groups}>
            {likedTags.length > 0 && (
              <TasteGroup
                title="당신이 좋아하는 것"
                tags={likedTags}
                caption="설문 응답 기반"
              />
            )}

            {likedTags.length > 0 && challengeTags.length > 0 ? (
              <div className={styles.divider} aria-hidden="true" />
            ) : null}

            {challengeTags.length > 0 && (
              <TasteGroup
                challenge
                title="새로운 도전을 해보세요"
                tags={challengeTags}
                caption="비슷한 유저들이 즐긴 새로운 취향"
              />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
