import { Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { css, cx } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { PageContainer } from '@/components/layout/PageContainer';

// 모바일(<sm, 640px) 전용 메인 히어로 (RESPONSIVE-FE-005).
//   카드 그리드가 1열로 떨어지는 좁은 폭에서는 풀블리드 배너 대신 텍스트+CTA만 노출한다.
//   (sm 이상에서는 HeroBanner가 기존 풀블리드 DesktopHeroBanner를 보여줌 — 카드 2열과 동시 전환.)
//   배경 이미지 없음: 게임 이미지는 바로 아래 추천/신규 리스트가 담당한다.
//   라벨/헤드라인/CTA 카피와 토큰은 기존 HeroBanner와 통일(semantic token만, 신규 토큰/recipe 없음).

const styles = {
  // display 토글로 <sm 에서만 노출(HeroBanner가 Desktop과 함께 렌더, 카드 그리드 sm과 동일 전환).
  section: css({
    display: { base: 'block', sm: 'none' },
    bg: 'bg.canvas',
    borderBottom: '1px solid',
    borderColor: 'border.default',
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    py: '10',
  }),
  // 상단 라벨 — Sparkles 아이콘 + 안내 카피(기존 HeroBanner와 동일).
  label: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2',
    mb: '3',
    fontSize: 'sm',
    fontWeight: 'medium',
    color: 'fg.muted',
  }),
  labelIcon: css({ color: 'accent.default', flexShrink: 0 }),
  // 헤드라인 — display 폰트(데스크탑 54px)를 모바일 6xl(30px)로(기존 모바일 분기와 동일 크기).
  headline: css({
    textStyle: 'display.lg',
    fontSize: '6xl',
    color: 'fg.default',
    lineHeight: 'tight',
  }),
  accentWord: css({ color: 'accent.default' }),
  // CTA — 모바일은 세로 풀폭 스택(버튼이 항상 완전히 보임).
  ctaCol: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    mt: '7',
    w: 'full',
  }),
  ctaFull: css({ w: 'full' }),
};

export function MobileHeroBanner() {
  return (
    <section className={styles.section} aria-label="오늘의 추천">
      <PageContainer className={styles.content}>
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

        <div className={styles.ctaCol}>
          <Link
            to="/recommendations"
            className={cx(
              button({ variant: 'primary', size: 'lg' }),
              styles.ctaFull,
            )}
          >
            추천 게임 찾기 →
          </Link>
          <Link
            to="/search"
            className={cx(
              button({ variant: 'secondary', size: 'lg' }),
              styles.ctaFull,
            )}
          >
            <Search size={18} />
            탐색 시작하기
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
