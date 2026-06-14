import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';

const loginStyles = {
  page: css({
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: { base: '4', md: '16' },
    px: '6',
  }),
  card: css({
    display: 'flex',
    flexDirection: { base: 'column', md: 'row' },
    alignItems: 'center',
    justifyContent: 'center',
    gap: { base: '5', md: '16' },
    w: 'full',
    maxW: { base: '400px', md: '860px' },
    bg: 'transparent',
    border: 'none',
    p: { base: '8', md: '0' },
  }),
  mascot: css({
    w: { base: '180px', md: '300px' },
    flexShrink: 0,
    objectFit: 'contain',
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '4', md: '5' },
    alignItems: { base: 'center', md: 'flex-start' },
    textAlign: { base: 'center', md: 'start' },
    w: { base: 'full', md: 'auto' },
  }),
  title: css({
    fontSize: { base: '2xl', md: '4xl' },
    fontWeight: 'extrabold',
    color: 'fg.default',
    lineHeight: 'tight',
  }),
  accent: css({ color: 'accent.default' }),
  desc: css({
    fontSize: { base: 'md', md: 'lg' },
    color: 'fg.muted',
    lineHeight: 'relaxed',
  }),
  btnWrap: css({
    mt: { base: '0', md: '2' },
    w: { base: 'full', md: 'auto' },
  }),
};

export function GuestRecommendations({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return (
      <div className={loginStyles.page}>
        <div className={loginStyles.card}>
          <img
            src="/images/gami-guide.png"
            alt="감비 캐릭터"
            className={loginStyles.mascot}
          />
          <div className={loginStyles.content}>
            <h1 className={loginStyles.title}>
              <span className={loginStyles.accent}>취향 맞춤</span> 게임 추천,
              <br />
              지금 바로 받아보세요
            </h1>
            <p className={loginStyles.desc}>
              로그인 후 취향 분석을 완료하면
              <br />
              나만을 위한 게임 추천을 바로 받을 수 있어요.
            </p>
            <div className={loginStyles.btnWrap}>
              <Button variant="primary" size="lg" asChild>
                <Link to="/login">로그인하고 추천받기 ›</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={loginStyles.page}>
      <div className={loginStyles.card}>
        <img
          src="/images/gami-guide.png"
          alt="감비 캐릭터"
          className={loginStyles.mascot}
        />
        <div className={loginStyles.content}>
          <h1 className={loginStyles.title}>
            <span className={loginStyles.accent}>취향 분석</span>을 완료하면
            <br />
            맞춤 추천을 받을 수 있어요
          </h1>
          <p className={loginStyles.desc}>
            간단한 설문으로 취향을 분석하면
            <br />
            나만을 위한 게임 추천을 바로 받을 수 있어요.
          </p>
          <div className={loginStyles.btnWrap}>
            <Button variant="primary" size="lg" asChild>
              <Link to="/survey">설문조사 진행하기 ›</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
