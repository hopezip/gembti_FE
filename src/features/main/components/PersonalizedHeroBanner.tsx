import { Link } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { pageContainer, pageGutter } from '@/components/layout/PageContainer';
import { usePersonalizedHome } from '@/features/main/api/personalizedHome';

// MAIN-FE-006 개인화 메인 Hero 배너 (Figma Hero 387:5567).
// 구조(3층): ① 배경(top_recommendation.background_url 또는 그라데이션 placeholder)
//            ② 좌→우 어두운 그라데이션 오버레이(텍스트 가독성)
//            ③ pageContainer 안쪽 좌측 텍스트 오버레이(매칭률·라벨칩·헤드라인·서브카피·CTA 3개)
// 배경은 풀블리드라 PageContainer 컴포넌트 대신 pageGutter/pageContainer 조각을 합성한다(게스트 HeroBanner 동일 패턴).
// 색은 semantic token만, 신규 토큰/recipe 없음. 다크·데스크탑 전용.
// 4상태/항상렌더: top_recommendation이 없어도(로딩/에러/빈) 카피·CTA는 항상 렌더하고, 매칭률·배경만 데이터 의존이다.

const styles = {
  section: css({
    position: 'relative',
    overflow: 'hidden',
    minH: '460px', // Figma Hero 높이
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: 'border.default',
  }),
  // ① 배경 레이어 — background_url이 있으면 인라인 style로 url 주입(런타임 데이터), 없으면 surface 단색.
  bgLayer: css({
    position: 'absolute',
    inset: '0',
    bg: 'bg.surface',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
  // ② 좌→우 어두운 그라데이션 오버레이 — 좌측 텍스트 영역을 진하게.
  overlay: css({
    position: 'absolute',
    inset: '0',
    backgroundImage:
      'linear-gradient(to right, token(colors.bg.canvas) 0%, token(colors.bg.canvas) 28%, color-mix(in srgb, token(colors.bg.canvas) 55%, transparent) 62%, color-mix(in srgb, token(colors.bg.canvas) 15%, transparent) 100%)',
  }),
  // ③ 콘텐츠 거터 래퍼 — 절대배치 레이어 위로 올린다.
  gutter: css({
    position: 'relative',
    zIndex: '1',
    w: 'full',
  }),
  // 매칭률 + 라벨을 한 줄에(Figma 387:5575/5570: 94%가 라벨 좌측, 같은 행). baseline 정렬.
  labelRow: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: '2',
    mb: '3',
  }),
  // 주황 매칭률 — JetBrains Mono Bold(accent). 데이터 의존이라 없으면 숨긴다.
  matchRate: css({
    fontFamily: 'mono',
    fontSize: '2xl', // 18px(Figma 실측 17px에 가장 근접한 토큰)
    fontWeight: 'bold',
    color: 'accent.default',
    lineHeight: 'none',
    flexShrink: 0,
  }),
  content: css({
    maxW: '620px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  }),
  // 라벨칩 — accent 텍스트(JetBrains Mono Regular), 자간 넓힘. 간격은 labelRow가 소유.
  label: css({
    fontFamily: 'mono',
    fontSize: 'xs', // 11px(Figma 11.5px 근접)
    color: 'accent.default',
    letterSpacing: '0.8px',
  }),
  // 작은 헤드라인 줄 — 24px Black.
  headlineSmall: css({
    fontSize: '5xl', // 24px
    fontWeight: 'extrabold',
    color: 'fg.default',
    letterSpacing: '-0.3px',
    mb: '2',
  }),
  // 큰 헤드라인(h1) — 30px Black, 자간 좁힘.
  headline: css({
    textStyle: 'heading.h1', // 30px extrabold(Figma 32px에 가장 근접한 토큰)
    color: 'fg.default',
  }),
  accentWord: css({ color: 'accent.default' }),
  subcopy: css({
    textStyle: 'body.md',
    color: 'fg.muted',
    mt: '4',
  }),
  ctaRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    mt: '8',
  }),
  // CTA hover 시 살짝 떠오르는 피드백(기존 durations 토큰만 사용).
  ctaLift: css({
    transition: 'transform {durations.fast}',
    _hover: { transform: 'translateY(-1px)' },
  }),
};

export function PersonalizedHeroBanner() {
  const { data } = usePersonalizedHome();
  const top = data?.topRecommendation;

  // 배경은 top_recommendation.background_url만 사용. 없으면 surface 단색 + 그라데이션 fallback.
  // 카피·CTA는 데이터와 무관하게 항상 렌더된다(개인화 카피는 하드코딩 유지).
  const backgroundUrl = top?.backgroundUrl;
  const hasCover = Boolean(backgroundUrl);
  // 1순위 상세 이동 — 게임 id가 있을 때만 실제 경로, 없으면(로딩 등) 추천 목록으로 폴백.
  const detailTo = top ? `/games/${top.gameId}` : '/recommendations';

  return (
    <section className={styles.section} aria-label="당신을 위한 1순위 추천">
      {/* ① 배경: 1순위 커버 이미지(런타임 url) 또는 surface 단색 */}
      <div
        className={styles.bgLayer}
        style={
          hasCover ? { backgroundImage: `url(${backgroundUrl})` } : undefined
        }
        aria-hidden="true"
      />

      {/* ② 그라데이션 오버레이 */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* ③ 좌측 텍스트 오버레이 — pageGutter/pageContainer 합성으로 다른 영역과 좌우 라인 정렬 */}
      <div className={cx(css(pageGutter), styles.gutter)}>
        <div className={css(pageContainer)}>
          <div className={styles.content}>
            {/* 매칭률(데이터 있을 때만) + 라벨을 한 줄에 — Figma 상단 행 */}
            <div className={styles.labelRow}>
              {top != null && (
                <span className={styles.matchRate}>{top.matchRate}%</span>
              )}
              <span className={styles.label}>당신을 위한 1순위 · AI 매칭</span>
            </div>

            <p className={styles.headlineSmall}>
              이 게임, 분명 좋아하실 거예요
            </p>

            <h1 className={styles.headline}>
              당신의 <span className={styles.accentWord}>다음</span>
              <br />
              인생 게임은 이거예요
            </h1>

            <p className={styles.subcopy}>
              {top?.reasonSummary ??
                '취향 분석 결과를 바탕으로 1순위 추천을 준비하고 있어요.'}
            </p>

            <div className={styles.ctaRow}>
              <Link
                to={detailTo}
                className={cx(
                  button({ variant: 'primary', size: 'md' }),
                  styles.ctaLift,
                )}
              >
                바로 보기 →
              </Link>
              <Link
                to="/recommendations"
                className={cx(
                  button({ variant: 'secondary', size: 'md' }),
                  styles.ctaLift,
                )}
              >
                다른 추천
              </Link>
              <Link
                to="/survey"
                className={cx(
                  button({ variant: 'secondary', size: 'md' }),
                  styles.ctaLift,
                )}
              >
                설문 이어서 하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
