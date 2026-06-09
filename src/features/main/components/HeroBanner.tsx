import { Link } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { pageContainer, pageGutter } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import { useGuestHome } from '@/features/main/api/guestHome';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

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
  }),
  // ① 배경 레이어 — background_image_url이 있으면 인라인 style로 url 주입(런타임 데이터), 없으면 surface 단색.
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
  // Tag recipe 기본(tone neutral: fg.muted/medium)을 Figma 칩(#7a7a82·Regular)에 맞춰 override.
  label: css({ mb: '5', color: 'fg.subtle', fontWeight: 'normal' }),
  headline: css({
    textStyle: 'display.lg', // Figma 히어로 헤드라인 54px(자간 -1.2px). heading.h1(30px) 아님.
    color: 'fg.default',
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
  }),
  // CTA hover 시 살짝 떠오르는 피드백(기존 durations 토큰만 사용).
  ctaLift: css({
    transition: 'transform {durations.fast}',
    _hover: { transform: 'translateY(-1px)' },
  }),
};

export function HeroBanner() {
  const { data } = useGuestHome();

  // 설문 진행 중 건너뛴 문항이 존재하는지 여부
  // 건너뛴 문항이 있다면 메인 배너에서 '설문 이어하기'를 노출한다.
  const hasSkippedQuestions = useSurveyProgressStore(
    (state) => state.skippedQuestionIds.length > 0,
  );
  // 로그인한 사용자 중
  // 설문 미완료 상태이거나 건너뛴 문항이 있는 경우에만
  // 메인 배너의 설문 CTA를 노출한다.
  const showSurveyCta = useAuthStore(
    (state) =>
      state.status === 'authenticated' &&
      (!state.user?.hasCompletedSurvey || hasSkippedQuestions),
  );

  // 배경은 guest-home의 curation_banner.background_image_url만 사용한다.
  // 이미지가 없으면(로딩/에러/빈/자산 미정) surface 단색 + 그라데이션 fallback이 되고,
  // 배너 텍스트·CTA는 데이터와 무관하게 항상 렌더된다(비로그인 카피는 하드코딩 유지).
  const backgroundImageUrl = data?.curationBanner.backgroundImageUrl;
  const hasCover = Boolean(backgroundImageUrl);

  return (
    <section className={styles.section} aria-label="오늘의 추천">
      {/* ① 배경: 커버 이미지(런타임 url) 또는 surface + 흐릿한 제목 */}
      <div
        className={styles.bgLayer}
        style={
          hasCover
            ? { backgroundImage: `url(${backgroundImageUrl})` }
            : undefined
        }
        aria-hidden="true"
      />

      {/* ② 그라데이션 오버레이 */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* ③ 좌측 텍스트 오버레이 — pageGutter/pageContainer 합성으로 다른 영역과 좌우 라인 정렬 */}
      <div className={cx(css(pageGutter), styles.gutter)}>
        <div className={css(pageContainer)}>
          <div className={styles.content}>
            <Tag className={styles.label}>오늘의 추천</Tag>

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

              {showSurveyCta && (
                // 설문 진행 상태에 따라 CTA 목적지와 문구를 변경한다.
                // -건너뛴문항 존재: 설문 이어하기 - 설문 미시작: 설문 진행하기
                <Link
                  to={hasSkippedQuestions ? '/survey' : '/survey/intro'}
                  className={cx(
                    button({ variant: 'secondary', size: 'lg' }),
                    styles.ctaLift,
                  )}
                >
                  {hasSkippedQuestions ? '설문 이어하기' : '설문 진행하기'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
