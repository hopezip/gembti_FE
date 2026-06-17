import { css } from 'styled-system/css';
import { STEAM_AUTH_START_URL } from '@/config/steam';
import { clearSteamAuthIntent } from '@/features/onboarding/lib/steamAuthIntent';

// "Steam으로 계속하기" — 백엔드 OpenID 진입(GET /api/v1/auth/steam)으로 브라우저를 이동시킨다.
//   REQ-003 A안(백엔드 위임): FE는 백엔드 엔드포인트로 보내고, 백엔드가 Steam OpenID로 리다이렉트한다.
//   콜백 분기(success/signup_required/failed)는 /steam/callback(STEAM-INTER-FE-007)이 처리한다.
//   신규/기존 유저 판별과 콜백 result는 모두 백엔드가 결정한다(FE는 진입만 책임).
//
// ⚠️ Steam 브랜드색(#1b2838/#66c0f4 등) 사용 금지(토큰에 없음).
//   semantic 토큰(bg.subtle/border.default/fg.default)으로만 스타일한다. 브랜드색은 후속 토큰 추가 후.

interface SteamButtonProps {
  /** 버튼 라벨. 로그인="Steam으로 계속하기"(기본), 회원가입="Steam 계정으로 가입하기". */
  label?: string;
}

export function SteamButton({
  label = 'Steam으로 계속하기',
}: SteamButtonProps = {}) {
  return (
    <button
      type="button"
      onClick={() => {
        clearSteamAuthIntent();
        window.location.href = STEAM_AUTH_START_URL;
      }}
      className={css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2',
        w: 'full',
        py: '2.5',
        px: '4',
        textStyle: 'body.sm',
        fontWeight: 'semibold',
        bg: 'bg.subtle',
        color: 'fg.default',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'lg',
        cursor: 'pointer',
        transition: 'background 0.15s',
        _hover: { bg: 'bg.surfaceRaised' },
        _focusVisible: {
          outline: '2px solid',
          outlineColor: 'border.accent',
          outlineOffset: '1px',
        },
      })}
    >
      {/* 아이콘 자리(시각용). 브랜드색 없이 텍스트 이모지로만 표기 */}
      <span aria-hidden="true">🎮</span>
      {label}
    </button>
  );
}
