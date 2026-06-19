import { Flame, Gamepad2, Gift, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { pageContainer, pageGutter } from '@/components/layout/PageContainer';
import { useBannerImages } from '@/features/main/api/bannerImages';
import { HeroBackgroundCarousel } from '@/features/main/components/HeroBackgroundCarousel';
import { MobileHeroBanner } from '@/features/main/components/MobileHeroBanner';

// MAIN-FE-001 비로그인 메인 Hero 배너 (Figma Hero 387:4742).
// 구조(3층): ① 배경(추천 첫 1건 커버 이미지 또는 그라데이션 placeholder)
//            ② 좌→우 어두운 그라데이션 오버레이(텍스트 가독성)
//            ③ pageContainer 안쪽 좌측 텍스트 오버레이(라벨/헤드라인/피처/CTA)
// 배경은 풀블리드라 PageContainer 컴포넌트 대신 pageGutter/pageContainer 조각을 합성한다
//   (Header/Footer 동일 패턴 — bg가 화면 끝까지 닿아야 하므로).
// 색은 semantic token만, 신규 토큰/recipe 없음. 다크·데스크탑 전용.

// Hero 좌측 피처 3행(취향 분석/인기/혜택). 아이콘 + 2줄 카피.
const heroFeatures = [
  { Icon: Gamepad2, title: '취향 분석 기반', desc: '정확한 추천' },
  { Icon: Flame, title: '지금 핫한', desc: '인기 게임' },
  { Icon: Gift, title: '추천만 해도', desc: '특별한 혜택' },
] as const;

const styles = {
  section: css({
    position: 'relative',
    overflow: 'hidden',
    minH: '460px', // Figma Hero 높이
    // sm(640px) 이상에서만 풀블리드 배너 노출. 미만(카드 1열)에서는 MobileHeroBanner가 대신 노출(RESPONSIVE-FE-005).
    display: { base: 'none', sm: 'flex' },
    alignItems: 'center',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    // 모바일(≤768px): 360px 폭에서도 헤드라인과 CTA가 잘리지 않도록 최소 높이를 확보한다(#272).
    // RESPONSIVE-FE-005로 <640px(카드 1열)는 MobileHeroBanner가 대신 노출되므로,
    // 이 풀블리드 배너의 모바일 분기는 실질적으로 640~768px 구간에만 적용된다.
    '@media (max-width: 768px)': {
      minH: '340px',
      py: '8',
    },
  }),
  // ① 배경 레이어 — 단색 fallback. 실제 배경은 위에 겹치는 HeroBackgroundCarousel이 담당(MAIN-FE-009).
  bgLayer: css({
    position: 'absolute',
    inset: '0',
    bg: 'bg.surface',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
  // ② bg.canvas 그라데이션 오버레이 — 좌측을 페이지 배경색으로 자연스럽게 블렌딩.
  overlay: css({
    position: 'absolute',
    inset: '0',
    zIndex: '1',
    background:
      'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 28%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0.12) 72%, transparent 100%)',
  }),
  // ③ 검정 반투명 오버레이 — 텍스트 영역(좌측)만 어둡게, 우측은 투명.
  darkOverlay: css({
    display: 'none',
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
  // 상단 라벨 — 아이콘 + 작은 안내 카피(헤드라인 위).
  label: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    mb: '4',
    fontSize: 'sm',
    fontWeight: 'medium',
    color: 'fg.muted',
    textShadow: '0 1px 6px token(colors.bg.canvas)',
  }),
  labelIcon: css({ color: 'accent.default', flexShrink: 0 }),
  headline: css({
    textStyle: 'display.lg', // Figma 히어로 헤드라인 54px(자간 -1.2px). heading.h1(30px) 아님.
    color: 'fg.default',
    lineHeight: 'tight',
    // 밝은 배경 캐러셀 위에서도 또렷하도록 글자를 어둡게 감싸는 드롭섀도우(가독성).
    textShadow:
      '0 2px 8px token(colors.bg.canvas), 0 0 24px token(colors.bg.canvas)',
    // 모바일(≤768px): 54px는 너무 커서 30px(6xl)로 축소(RESPONSIVE-FE-001).
    '@media (max-width: 768px)': { fontSize: '6xl' },
  }),
  accentWord: css({ color: 'accent.default' }),
  // 피처 3행 — 아이콘 박스 + 2줄 카피. 모바일에서는 숨김.
  features: css({
    display: 'flex',
    gap: '6',
    mt: '7',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': { display: 'none' },
  }),
  featureItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2.5',
  }),
  featureIcon: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '9',
    h: '9',
    borderRadius: 'lg',
    bg: 'bg.surfaceRaised',
    color: 'accent.default',
    flexShrink: 0,
  }),
  featureTitle: css({
    fontSize: 'sm',
    fontWeight: 'semibold',
    color: 'fg.default',
    lineHeight: 'tight',
    textShadow: '0 1px 6px token(colors.bg.canvas)',
  }),
  featureDesc: css({
    fontSize: 'xs',
    color: 'fg.muted',
    lineHeight: 'tight',
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

// 풀블리드 배너(데스크탑·sm 이상). 좁은 폭(<sm)에서는 display:none으로 숨고 MobileHeroBanner가 대신 노출된다.
function DesktopHeroBanner() {
  // 배경은 캐러셀(인기 상위 5개 커버, 10초 자동 전환)이 담당한다 (MAIN-FE-009).
  const bannerImages = useBannerImages();

  return (
    <section className={styles.section} aria-label="오늘의 추천">
      {/* ① 배경: 단색 fallback + 그 위 이미지 캐러셀(이미지 없으면 단색만 노출) */}
      <div className={styles.bgLayer} aria-hidden="true" />
      <HeroBackgroundCarousel images={bannerImages} />

      {/* ② bg.canvas 그라데이션 오버레이 */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* ③ 좌측 텍스트 오버레이 — pageGutter/pageContainer 합성으로 다른 영역과 좌우 라인 정렬 */}
      <div className={cx(css(pageGutter), styles.gutter)}>
        <div className={css(pageContainer)}>
          <div className={styles.content}>
            <p className={styles.label}>
              <Sparkles className={styles.labelIcon} size={16} />
              취향에 딱 맞는 게임을 추천해드려요
            </p>

            <h1 className={styles.headline}>
              당신의 <span className={styles.accentWord}>다음</span>
              <br />
              인생 게임을
              <br />
              찾아보세요
            </h1>

            <ul className={styles.features} aria-label="추천 서비스 특징">
              {heroFeatures.map(({ Icon, title, desc }) => (
                <li className={styles.featureItem} key={title}>
                  <span className={styles.featureIcon} aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className={styles.featureTitle}>{title}</span>
                    <br />
                    <span className={styles.featureDesc}>{desc}</span>
                  </span>
                </li>
              ))}
            </ul>

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
                <Search size={18} />
                탐색 시작하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 메인 히어로 — 화면 폭에 따라 모바일 텍스트형(<sm)과 풀블리드(sm+)를 스왑한다(RESPONSIVE-FE-005).
// 카드 그리드(GameGridSection)와 동일한 sm(640px) 기준이라 "카드 1열 ↔ 텍스트 히어로"가 항상 함께 전환된다.
// 둘 다 마크업하고 CSS display로만 토글(JS 분기 없음 → SSR/초기 렌더 깜빡임 없음).
export function HeroBanner() {
  return (
    <>
      <MobileHeroBanner />
      <DesktopHeroBanner />
    </>
  );
}
