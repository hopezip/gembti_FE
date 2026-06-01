import { css } from 'styled-system/css';

// "Steam으로 계속하기" 비활성(disabled) 자리 버튼.
// 실제 OAuth는 후속 LOGIN-FE-002에서 구현하므로 여기서는 동작 없는 placeholder다.
//
// ⚠️ Steam 브랜드색(#1b2838/#66c0f4/#2a4358) 사용 금지(토큰에 없음).
//   기존 semantic 토큰(bg.subtle/border.default/fg.subtle) + disabled opacity로만 스타일한다.
//   브랜드 정확색은 LOGIN-FE-002에서 토큰 추가 후 적용.
// disabled 버튼이므로 클릭/포커스 동작 없음. "준비 중"은 aria-disabled + title로 전달.

export function SteamButton() {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title="준비 중"
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
        color: 'fg.subtle',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'lg',
        opacity: 0.6,
        cursor: 'not-allowed',
      })}
    >
      {/* 아이콘 자리(시각용). 브랜드색 없이 텍스트 이모지로만 표기 */}
      <span aria-hidden="true">🎮</span>
      Steam으로 계속하기
    </button>
  );
}
