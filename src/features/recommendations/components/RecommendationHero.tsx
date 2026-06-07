import { css } from 'styled-system/css';
import { Tag } from '@/components/ui/Tag';
import { PageContainer } from '@/components/layout/PageContainer';
import { usePersonalizedHome } from '@/features/main/api/personalizedHome';
import { useAuthStore } from '@/lib/store/useAuthStore';

// REC-FE-002 게임 추천 페이지 Hero — Figma 게임추천 페이지(node 4003:2288) 기준.
// 구조: 헤드라인(닉네임 + "다음 게임" accent 강조) + 메타 캡션
//       + 취향 2그룹(둘 다 외곽선 칩, 색으로 구분: ① 좋아하는 것=accent 외곽선 / ② 새로운 도전=neutral 외곽선).
//       Figma: 그룹① "Overlay+Border"(stroke #ef5a2c·text #fb7b27=accent) / 그룹② "Border"(stroke #35353c·text #f2f2f2=neutral).
// 각 그룹 = accent 마커(작은 주황 막대) + 소제목 + 칩들 + 캡션.
// 데이터 출처: usePersonalizedHome (recommendationProfile + userInterestTags).
// 색은 semantic token만, 신규 토큰/recipe 없음. 다크·데스크탑 전용.
// 4상태/항상렌더: 로딩/에러/빈 데이터에서도 헤드라인·메타는 항상 렌더하고,
//   칩·캡션 등 데이터 의존 부분만 조건부 렌더한다(PersonalizedHeroBanner 패턴 동일).

const styles = {
  // 섹션 — PageContainer 위/아래 여백만(좌우 거터·maxW는 PageContainer 소유).
  section: css({
    pt: '12', // 48px
    pb: '10', // 40px
    borderBottom: '1px solid',
    borderColor: 'border.default',
  }),
  // 헤드라인(h1) — 30px Black. "다음 게임"만 accent 강조.
  headline: css({
    textStyle: 'heading.h1', // 30px extrabold
    color: 'fg.default',
  }),
  accentWord: css({ color: 'accent.default' }),
  // 메타 캡션 — fg.muted 작은 텍스트. 헤드라인 아래.
  meta: css({
    textStyle: 'body.md',
    color: 'fg.muted',
    mt: '3',
  }),
  // 취향 2그룹 컨테이너 — 좌우 가로 배치(Figma: 그룹① x=103 / 그룹② x=586, 같은 y=124).
  groups: css({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap', // 데스크탑 전용이나 1100 미만 fallback에서 줄바꿈 허용.
    alignItems: 'flex-start',
    gap: '12', // 그룹 간 좌우 간격 48px(Figma 두 컬럼 분리).
    mt: '9', // 메타 → 그룹 ~36px
  }),
  // 각 그룹 — 세로(소제목·칩·캡션). Figma 컬럼 폭 469에 맞춰 동일 폭으로 좌우 정렬.
  group: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    w: '469px',
    maxW: 'full', // fallback에서 컨테이너보다 넓어지지 않도록.
  }),
  // 소제목 행 — accent 마커 + 소제목 텍스트.
  groupHeading: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2', // 8px
  }),
  // accent 마커 — Figma 하트/반짝임 SVG를 작은 주황 세로 막대로 단순화(인라인 SVG 금지).
  marker: css({
    w: '1', // 4px
    h: '4', // ~16px
    bg: 'accent.default',
    borderRadius: 'full',
    flexShrink: 0,
  }),
  groupTitle: css({
    fontSize: 'xl', // 16px
    fontWeight: 'bold',
    color: 'fg.default',
  }),
  // 칩들 — 가로 wrap.
  chips: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2', // 8px
  }),
  // 그룹 캡션 — fg.muted 작은 텍스트.
  caption: css({
    textStyle: 'body.sm',
    color: 'fg.muted',
  }),
};

export function RecommendationHero() {
  const { data } = usePersonalizedHome();
  // 닉네임은 표시용 — 없으면 '게이머' 폴백(로딩/비로그인 등). status/토큰은 직접 만지지 않는다.
  const nickname = useAuthStore((s) => s.user?.nickname);
  const displayName = nickname ?? '게이머';

  // 데이터 의존부 — 없을 수 있다(로딩/에러/빈). 항상 옵셔널 접근.
  const likedTags = data?.userInterestTags ?? [];
  const profile = data?.recommendationProfile;
  const challengeTags = profile?.challengeTags ?? [];
  const lastUpdatedText = profile?.lastUpdatedText;

  return (
    <PageContainer className={styles.section}>
      {/* 헤드라인 — 닉네임 + "다음 게임" accent 강조. 데이터와 무관하게 항상 렌더. */}
      <h1 className={styles.headline}>
        {displayName} 님, 당신의{' '}
        <span className={styles.accentWord}>다음 게임</span>을 골라봤어요
      </h1>

      {/* 메타 캡션 — 마지막 업데이트는 값 있을 때만 덧붙인다(항상 렌더되는 앞부분 + 조건부 뒷부분). */}
      <p className={styles.meta}>
        현재 취향 기준 추천
        {lastUpdatedText ? ` · 마지막 업데이트 ${lastUpdatedText}` : ''}
      </p>

      {/* 취향 2그룹 — 칩이 하나라도 있는 그룹만 렌더(데이터 의존부). */}
      {(likedTags.length > 0 || challengeTags.length > 0) && (
        <div className={styles.groups}>
          {/* 그룹① 당신이 좋아하는 것 — accent 외곽선 칩(주황 테두리+주황 텍스트, Figma Overlay+Border). 캡션=likedMeta. */}
          {likedTags.length > 0 && (
            <section className={styles.group}>
              <div className={styles.groupHeading}>
                <span className={styles.marker} aria-hidden="true" />
                <span className={styles.groupTitle}>당신이 좋아하는 것</span>
              </div>
              <div className={styles.chips}>
                {likedTags.map((label) => (
                  <Tag key={label} tone="review">
                    {label}
                  </Tag>
                ))}
              </div>
              {profile?.likedMeta ? (
                <span className={styles.caption}>{profile.likedMeta}</span>
              ) : null}
            </section>
          )}

          {/* 그룹② 새로운 도전을 해보세요 — neutral 외곽선 칩(회색 테두리+muted 텍스트, Figma Border). 캡션=challengeMeta. */}
          {challengeTags.length > 0 && (
            <section className={styles.group}>
              <div className={styles.groupHeading}>
                <span className={styles.marker} aria-hidden="true" />
                <span className={styles.groupTitle}>
                  새로운 도전을 해보세요
                </span>
              </div>
              <div className={styles.chips}>
                {challengeTags.map((label) => (
                  <Tag key={label} tone="neutral">
                    {label}
                  </Tag>
                ))}
              </div>
              {profile?.challengeMeta ? (
                <span className={styles.caption}>{profile.challengeMeta}</span>
              ) : null}
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
