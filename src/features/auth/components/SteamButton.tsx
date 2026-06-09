import { css } from 'styled-system/css';
import { STEAM_AUTH_START_URL } from '@/config/steam';

// "Steam으로 계속하기" — 백엔드 OpenID 진입(GET /api/v1/auth/steam)으로 브라우저를 이동시킨다.
//   REQ-003 A안(백엔드 위임): FE는 백엔드 엔드포인트로 보내고, 백엔드가 Steam OpenID로 리다이렉트한다.
//   콜백 분기(success/signup_required/failed)는 /steam/callback(STEAM-INTER-FE-007)이 처리한다.
//
// ⚠️ Steam 브랜드색(#1b2838/#66c0f4 등) 사용 금지(토큰에 없음).
//   semantic 토큰(bg.subtle/border.default/fg.default)으로만 스타일한다. 브랜드색은 후속 토큰 추가 후.

// mock 모드 콜백 시뮬레이션 (STEAM-INTER-FE-007):
//   MSW Service Worker는 window.location 전체 네비게이션을 가로채지 못하므로, 백엔드 미구현 동안
//   mock 모드에서는 백엔드 OpenID 대신 콜백 URL로 직접 이동해 흐름을 끝까지 검증한다.
//   - signup_required: 신규 유저 → complete-signup 화면까지 (complete-signup mock이 받음)
//   - success: 기존 유저 (refresh+me는 실서버 의존이라 mock에선 /login으로 떨어진다 — 단위테스트로 검증)
const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const MOCK_SIGNUP_TOKEN = 'mock_steam_signup_token';

interface SteamButtonProps {
  /** 버튼 라벨. 로그인="Steam으로 계속하기"(기본), 회원가입="Steam 계정으로 가입하기". */
  label?: string;
  /** mock 모드에서 시뮬레이션할 콜백 결과. 가입 버튼은 'signup_required', 로그인 버튼은 'success'(기본). */
  mockResult?: 'success' | 'signup_required';
}

export function SteamButton({
  label = 'Steam으로 계속하기',
  mockResult = 'success',
}: SteamButtonProps = {}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (IS_MOCK) {
          const query =
            mockResult === 'signup_required'
              ? `result=signup_required&signup_token=${MOCK_SIGNUP_TOKEN}`
              : 'result=success&is_new_user=false&steam_linked=true';
          window.location.href = `/steam/callback?${query}`;
          return;
        }
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
