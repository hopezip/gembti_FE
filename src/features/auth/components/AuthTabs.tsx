import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';

// 인증 카드 상단 세그먼트 토글 [로그인 | 회원가입].
// Figma auth-modal 상단 탭. 실제 탭 위젯이 아니라 라우트 이동 링크다(routing.md SSOT: /login·/signup).
// active 세그먼트(현재 화면)는 bg.surfaceRaised/fg.default로 강조, 비활성은 fg.subtle + Link 이동.
// semantic token만 사용. primitive/hex/인라인 style 금지.

type AuthRoute = 'login' | 'signup';

interface AuthTabsProps {
  /** 현재 활성 탭(현재 화면) */
  active: AuthRoute;
}

// 세그먼트 컨테이너 — bg.canvas + border.default + radius.
const containerClass = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1',
  p: '1',
  bg: 'bg.canvas',
  border: '1px solid',
  borderColor: 'border.default',
  borderRadius: 'xl',
});

// 공통 세그먼트 시각(active/비활성 공통 베이스).
const segmentBase = css.raw({
  textStyle: 'body.sm',
  fontWeight: 'semibold',
  textAlign: 'center',
  py: '2',
  borderRadius: 'lg',
  cursor: 'pointer',
});

const activeSegment = css(segmentBase, {
  // 컨테이너(bg.canvas) 위로 한 단 올라온 elevation. 어두운 배경 + 밝은 텍스트로 대비 확보.
  bg: 'bg.surfaceRaised',
  color: 'fg.default',
});

const inactiveSegment = css(segmentBase, {
  color: 'fg.subtle',
  _hover: { color: 'fg.default' },
});

export function AuthTabs({ active }: AuthTabsProps) {
  const loginActive = active === 'login';

  return (
    <div className={containerClass}>
      {loginActive ? (
        // 현재 화면 = 로그인: 이동 없는 active 세그먼트(div, 비링크).
        <span aria-current="page" className={activeSegment}>
          로그인
        </span>
      ) : (
        <Link to="/login" className={inactiveSegment}>
          로그인
        </Link>
      )}

      {loginActive ? (
        <Link to="/signup" className={inactiveSegment}>
          회원가입
        </Link>
      ) : (
        <span aria-current="page" className={activeSegment}>
          회원가입
        </span>
      )}
    </div>
  );
}
