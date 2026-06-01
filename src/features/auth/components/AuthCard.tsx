import type { ReactNode } from 'react';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';

// 인증 화면 모달 스타일 카드 컨테이너 — Figma auth-modal(335:7434) 매핑.
// 전용 recipe가 없는 조합 컴포넌트라 styled-system/css + patterns(vstack) + semantic token으로 구성한다
// (새 토큰/textStyle 금지). 다크·데스크탑 전용. primitive(gray.900)/hex/인라인 style 금지.
//
// 구성(위→아래): ① 세그먼트 탭 슬롯(tabs) → ② 좌측 정렬 헤딩+부제 → ③ children(보조 버튼/구분선/폼).
// 실제 모달이 아닌 라우트 페이지이므로 ✕ 닫기 버튼은 두지 않는다(LOGIN-FE-001b 결정).
// 하단 회원가입 링크는 상단 탭으로 대체되어 제거했다.

interface AuthCardProps {
  /** 상단 세그먼트 탭 슬롯(AuthTabs) */
  tabs: ReactNode;
  /** 헤딩 위 mono eyebrow(예: "STEP 1 / 2 · 계정 정보"). 없으면 미표시. */
  eyebrow?: ReactNode;
  /** 좌측 정렬 헤딩 텍스트(예: 로그인) */
  heading: string;
  /** 헤딩 아래 부제 문구 */
  subtitle: string;
  /** 본문 슬롯(Steam 자리 버튼 / 구분선 / 폼 등) */
  children: ReactNode;
}

export function AuthCard({
  tabs,
  eyebrow,
  heading,
  subtitle,
  children,
}: AuthCardProps) {
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
          gap: '5',
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
        {/* ① 상단 세그먼트 탭 슬롯 */}
        {tabs}

        {/* ② 좌측 정렬 (eyebrow) + 헤딩 + 부제 */}
        <div className={vstack({ gap: '1', alignItems: 'flex-start' })}>
          {eyebrow && (
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: 'xs',
                fontWeight: 'medium',
                letterSpacing: 'wide',
                color: 'accent.default',
              })}
            >
              {eyebrow}
            </span>
          )}
          <h1
            className={css({
              // 22px 1:1 토큰이 없어 신규 textStyle 없이 근접 토큰으로 처리(LOGIN-FE-001b 결정).
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'fg.default',
            })}
          >
            {heading}
          </h1>
          <p className={css({ textStyle: 'body.sm', color: 'fg.muted' })}>
            {subtitle}
          </p>
        </div>

        {/* ③ 본문 슬롯(Steam 자리 / 구분선 / 폼) */}
        {children}
      </section>
    </main>
  );
}
