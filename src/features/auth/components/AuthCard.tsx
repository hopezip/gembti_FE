import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';

// 인증 화면 중앙 카드 컨테이너 — DESIGN_SYSTEM 08 인증(AuthCard) 매핑.
// 전용 recipe가 없는 조합 컴포넌트라 Field와 동일한 방식으로
// styled-system/css + patterns(vstack) + semantic token으로 구성한다(새 토큰/textStyle 금지).
// 다크·데스크탑 전용. primitive(gray.900)/hex/인라인 style 사용 금지.
//
// 구성: 제목 영역(서비스명/부제) → 폼 슬롯(children) → 후속 자리표시(footer 슬롯) → 하단 회원가입 링크.

interface AuthCardProps {
  /** 카드 제목(예: 이메일로 로그인) */
  title: string;
  /** 폼 등 본문 슬롯 */
  children: ReactNode;
  /** 후속 자리표시(Steam/자동 로그인 등) 슬롯. 없으면 렌더하지 않는다. */
  footer?: ReactNode;
}

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <main
      className={css({
        minH: '100vh',
        display: 'grid',
        placeItems: 'center',
        bg: 'bg.canvas',
        p: '8',
      })}
    >
      <section
        className={vstack({
          gap: '6',
          alignItems: 'stretch',
          w: 'min(420px, 100%)',
          bg: 'bg.surface',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: '3xl',
          p: '8',
          boxShadow: 'xl',
        })}
      >
        {/* 제목 영역 */}
        <div className={vstack({ gap: '1', alignItems: 'center' })}>
          <p
            className={css({
              fontFamily: 'mono',
              fontSize: 'xs',
              letterSpacing: 'wider',
              textTransform: 'uppercase',
              color: 'accent.fg',
            })}
          >
            GamBTI
          </p>
          <h1
            className={css({
              textStyle: 'heading.h2',
              color: 'fg.default',
              textAlign: 'center',
            })}
          >
            {title}
          </h1>
        </div>

        {/* 폼 슬롯 */}
        {children}

        {/* 후속 자리표시 슬롯(Steam/자동 로그인 등) — 있을 때만 */}
        {footer}

        {/* 하단 보조 링크: 회원가입 */}
        <p
          className={css({
            textStyle: 'body.sm',
            color: 'fg.subtle',
            textAlign: 'center',
          })}
        >
          계정이 없으신가요?{' '}
          <Link
            to="/signup"
            className={css({
              color: 'accent.fg',
              fontWeight: 'semibold',
              textDecoration: 'underline',
              _hover: { color: 'accent.default' },
            })}
          >
            회원가입
          </Link>
        </p>
      </section>
    </main>
  );
}
