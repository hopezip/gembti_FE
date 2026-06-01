import type { ReactNode } from 'react';
import { css } from 'styled-system/css';

// 인증 카드 본문 구분선 — "— 또는 이메일로 가입/로그인 —" 형태.
// 로그인/회원가입 양쪽에서 재사용한다(LOGIN-FE-003에서 LoginPage 인라인 구분선을 공용화).
// 장식이라 a11y 트리에서 숨긴다(aria-hidden). semantic token만 사용.

interface AuthDividerProps {
  /** 가운데 표시할 텍스트(예: "또는 이메일로 가입") */
  children: ReactNode;
}

export function AuthDivider({ children }: AuthDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        color: 'fg.subtle',
        textStyle: 'body.sm',
        _before: {
          content: '""',
          flex: '1',
          borderTop: '1px solid',
          borderColor: 'border.default',
        },
        _after: {
          content: '""',
          flex: '1',
          borderTop: '1px solid',
          borderColor: 'border.default',
        },
      })}
    >
      {children}
    </div>
  );
}
