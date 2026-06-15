import { Link } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { pageContainer, pageGutter } from '@/components/layout/PageContainer';
import { useBannerImages } from '@/features/main/api/bannerImages';
import { HeroBackgroundCarousel } from '@/features/main/components/HeroBackgroundCarousel';

// MAIN-FE-001 비로그인 메인 Hero 배너 (Figma Hero 387:4742).
// 구조(3층): ① 배경(추천 첫 1건 커버 이미지 또는 그라데이션 placeholder)
//            ② 좌→우 어두운 그라데이션 오버레이(텍스트 가독성)
//            ③ pageContainer 안쪽 좌측 텍스트 오버레이(라벨/헤드라인/서브/CTA)
// 배경은 풀블리드라 PageContainer 컴포넌트 대신 pageGutter/pageContainer 조각을 합성한다
//   (Header/Footer 동일 패턴 — bg가 화면 끝까지 닿아야 하므로).
// 색은 semantic token만, 신규 토큰/recipe 없음. 다크·데스크탑 전용.

const styles = {
  section: css({
    position: 'relative',
    overflow: 'hidden',
    minH: '460px', // Figma Hero 높이
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    // 모바일(≤768px): 높이를 줄여 과한 빈 공간 방지(데스크탑 전용 예외 — RESPONSIVE-FE-001).
    '@media (max-width: 768px)': { minH: '380px' },
  }),
  // ① 배경 레이어 — 단색 fallback. 실제 배경은 위에 겹치는 HeroBackgroundCarousel이 담당(MAIN-FE-009).
  bgLayer: css({
    position: 'absolute',
    inset: '0',
    bg: 'bg.surface',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
  // ② 좌→우 어두운 그라데이션 오버레이 — 좌측 텍스트 영역을 진하게, 우측은 투명에 가깝게.
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
  content: css({
    maxW: '620px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  }),
  headline: css({
    textStyle: 'display.lg', // Figma 히어로 헤드라인 54px(자간 -1.2px). heading.h1(30px) 아님.
    color: 'fg.default',
    // 모바일(≤768px): 54px는 너무 커서 30px(6xl)로 축소(RESPONSIVE-FE-001).
    '@media (max-width: 768px)': { fontSize: '6xl', lineHeight: 'tight' },
  }),
  accentWord: css({ color: 'accent.default' }),
  subcopy: css({
    textStyle: 'body.lg',
    color: 'fg.muted',
    mt: '4',
  }),
  ctaRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    mt: '8',
    // CTA가 좁은 폭에서 가로로 넘쳐 잘리지 않도록 줄바꿈 허용(RESPONSIVE-FE-001).
    flexWrap: 'wrap',
    '@media (max-width: 768px)': { gap: '2', mt: '6' },
  }),
  // CTA hover 시 살짝 떠오르는 피드백(기존 durations 토큰만 사용).
  ctaLift: css({
    transition: 'transform {durations.fast}',
    _hover: { transform: 'translateY(-1px)' },
  }),
};

export function HeroBanner() {
  // 배경은 캐러셀(인기 상위 5개 커버, 10초 자동 전환)이 담당한다 (MAIN-FE-009).
  const bannerImages = useBannerImages();

  return (
    <section className={styles.section} aria-label="오늘의 추천">
      {/* ① 배경: 단색 fallback + 그 위 이미지 캐러셀(이미지 없으면 단색만 노출) */}
      <div className={styles.bgLayer} aria-hidden="true" />
      <HeroBackgroundCarousel images={bannerImages} />

      {/* ② 그라데이션 오버레이 */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* ③ 좌측 텍스트 오버레이 — pageGutter/pageContainer 합성으로 다른 영역과 좌우 라인 정렬 */}
      <div className={cx(css(pageGutter), styles.gutter)}>
        <div className={css(pageContainer)}>
          <div className={styles.content}>
            <h1 className={styles.headline}>
              당신의 <span className={styles.accentWord}>다음</span>
              <br />
              인생 게임을 찾아보세요
            </h1>

            <p className={styles.subcopy}>취향에 딱 맞는 게임을 추천해드려요</p>

            <div className={styles.ctaRow}>
              <Link
                to="/recommendations"
                className={cx(
                  button({ variant: 'primary', size: 'lg' }),
                  styles.ctaLift,
                )}
              >
                추천 게임 찾기 →
              </Link>
              <Link
                to="/search"
                className={cx(
                  button({ variant: 'secondary', size: 'lg' }),
                  styles.ctaLift,
                )}
              >
                탐색 시작하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
