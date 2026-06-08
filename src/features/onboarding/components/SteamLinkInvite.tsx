import { css, cx } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { button } from 'styled-system/recipes';
import type { SteamLinkOrigin } from '../types';
import { SteamBenefitList } from './SteamBenefitList';

// 스팀 연동 유도 화면(화면1 emailSignup / 화면2 steamSignup).
// 순수 프리젠테이션: 데이터/네비게이션은 props·콜백으로만. 내부 fetch/navigate/useQuery 금지.
// origin별 카피·배지·benefits를 분기한다. 카피·타이포는 Figma 원문/스펙 그대로.
//   - emailSignup: 이메일 가입 완료 후 연동 유도 2카드 (Figma 4071:455, 헤딩 34px·강조 accent)
//   - steamSignup: 스팀 가입 직후 환영 배지 + 추천 카드 (Figma 4074:786)
// onLink=주 CTA(연동하기), onSkip=보조(둘러보기/나중에).

// 헤딩 세그먼트 — accent=true면 강조색(Figma의 오렌지 강조부) 적용.
interface HeadingSegment {
  text: string;
  accent: boolean;
}

interface InviteCopy {
  /** 환영/안내 배지(있으면 표시). steamSignup 전용. */
  badge: string | null;
  /** 중앙 헤딩(강조 세그먼트 분할). */
  headingSegments: HeadingSegment[];
  /** 헤딩 아래 설명. */
  description: string;
  /** 주 CTA 카드 상단 태그(예: '로그인 필요' / '추천'). */
  linkCardTag: string;
  /** 주 CTA 카드 제목. */
  linkCardTitle: string;
  /** 주 CTA 카드 설명. */
  linkCardDesc: string;
  /** 주 CTA 버튼 라벨. */
  linkLabel: string;
  /** 보조 카드 제목. */
  skipCardTitle: string;
  /** 보조 카드 설명. */
  skipCardDesc: string;
  /** 보조 CTA 버튼 라벨. */
  skipLabel: string;
  /** 하단 benefits 3항목. */
  benefits: { index: string; title: string; desc: string }[];
}

// origin별 카피 SSOT(Figma 원문). 컴포넌트는 이 맵만 분기 참조한다.
const COPY: Record<SteamLinkOrigin, InviteCopy> = {
  emailSignup: {
    badge: null,
    // Figma 4071:534 — "더 정확한 추천"만 오렌지 강조.
    headingSegments: [
      { text: 'Steam 라이브러리를 연동하면\n', accent: false },
      { text: '더 정확한 추천', accent: true },
      { text: '을 받을 수 있어요', accent: false },
    ],
    description:
      '내 보유 게임과 플레이 시간을 자동으로 가져와 6대 성향을 추정하고,\n진짜 내 취향에 맞는 게임을 추천해드려요. 30초면 충분합니다.',
    linkCardTag: '로그인 필요',
    linkCardTitle: 'Steam 연동하기',
    linkCardDesc:
      '로그인 후 Steam OpenID로 계정을 인증하면 라이브러리를 자동 동기화해요.',
    linkLabel: '연동하기 →',
    skipCardTitle: '먼저 둘러볼게요',
    skipCardDesc: '로그인 없이도 추천 콘텐츠와 커뮤니티를 둘러볼 수 있어요.',
    skipLabel: '홈으로 →',
    benefits: [
      {
        index: '01',
        title: '자동 라이브러리',
        desc: '보유한 모든 게임이 자동으로 라이브러리에 들어와요.',
      },
      {
        index: '02',
        title: '플레이 기반 추정',
        desc: '플레이 시간을 분석해 6대 성향을 자동 도출해요.',
      },
      {
        index: '03',
        title: '언제든 해제',
        desc: '마이페이지에서 1클릭으로 연동을 해제할 수 있어요.',
      },
    ],
  },
  steamSignup: {
    badge: '가입 완료 • 환영해요',
    // Figma 4074:885 — "Steam" 강조(화면2 정밀 시 재검증).
    headingSegments: [
      { text: '마지막으로, ', accent: false },
      { text: 'Steam', accent: true },
      { text: '을 연동할까요?', accent: false },
    ],
    description:
      'Steam 라이브러리를 연동하면 보유한 게임을 자동으로 가져와\n정확한 취향 분석과 추천을 받을 수 있어요. 나중에 마이페이지에서 언제든 연동해도 됩니다.',
    linkCardTag: '추천',
    linkCardTitle: 'Steam 연동하기',
    linkCardDesc: 'Steam OpenID로 인증하고 라이브러리를\n자동 동기화해요.',
    linkLabel: 'Steam으로 연동하기',
    skipCardTitle: '나중에 할게요',
    skipCardDesc:
      '지금은 둘러보고, 마음 들면 마이페이지에서\n언제든 연동할 수 있어요.',
    skipLabel: '건너뛰고 시작하기',
    benefits: [
      {
        index: '01',
        title: '자동 라이브러리',
        desc: '보유 게임이 자동으로 라이브러리에 추가돼요.',
      },
      {
        index: '02',
        title: '정확한 취향 추천',
        desc: '플레이 시간으로 더 정확한 취향을 추천해요.',
      },
      {
        index: '03',
        title: '커뮤니티 표시',
        desc: '커뮤니티에서 Steam 닉/아바타가 표시돼요.',
      },
    ],
  },
};

export interface SteamLinkInviteProps {
  origin: SteamLinkOrigin;
  /** 주 CTA(연동하기) 클릭 콜백. */
  onLink: () => void;
  /** 보조 CTA(둘러보기/나중에) 클릭 콜백. */
  onSkip: () => void;
}

export function SteamLinkInvite({
  origin,
  onLink,
  onSkip,
}: SteamLinkInviteProps) {
  const copy = COPY[origin];

  return (
    <main
      className={css({
        minH: '100vh',
        display: 'grid',
        placeItems: 'center',
        bg: 'bg.canvas',
        px: '8',
        py: '20',
      })}
    >
      <section
        className={vstack({
          gap: '8',
          alignItems: 'center',
          w: 'min(820px, 100%)',
        })}
      >
        {/* ① 환영 배지(steamSignup 전용) + 헤딩(34px·강조) + 설명(14px) */}
        <div className={vstack({ gap: '3', alignItems: 'center' })}>
          {copy.badge && (
            <span
              className={hstack({
                gap: '2',
                fontFamily: 'mono',
                fontSize: 'sm',
                fontWeight: 'medium',
                letterSpacing: 'wide',
                color: 'accent.fg',
              })}
            >
              <span
                aria-hidden="true"
                className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  w: '5',
                  h: '5',
                  borderRadius: 'full',
                  bg: 'accent.soft',
                  color: 'accent.fg',
                  fontSize: 'xs',
                })}
              >
                ✓
              </span>
              {copy.badge}
            </span>
          )}
          <h1
            className={css({
              // Figma 34px(Bold, -0.6) — 토큰 외 값이라 정밀 일치 위해 직접 지정.
              fontSize: '34px',
              fontWeight: 'bold',
              letterSpacing: 'tight',
              lineHeight: 'tight',
              color: 'fg.default',
              textAlign: 'center',
              whiteSpace: 'pre-line',
            })}
          >
            {copy.headingSegments.map((seg) =>
              seg.accent ? (
                <span key={seg.text} className={css({ color: 'accent.fg' })}>
                  {seg.text}
                </span>
              ) : (
                <span key={seg.text}>{seg.text}</span>
              ),
            )}
          </h1>
          <p
            className={css({
              fontSize: 'lg',
              lineHeight: 'relaxed',
              color: 'fg.muted',
              textAlign: 'center',
              whiteSpace: 'pre-line',
              maxW: '640px',
            })}
          >
            {copy.description}
          </p>
        </div>

        {/* ② 2카드: 주 CTA(연동) / 보조(둘러보기) */}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '5',
            w: 'full',
          })}
        >
          {/* 주 CTA 카드 — accent 강조 테두리 + 상단 태그 */}
          <div
            className={vstack({
              gap: '4',
              alignItems: 'flex-start',
              bg: 'bg.surface',
              border: '1px solid',
              borderColor: 'border.accent',
              borderRadius: '2xl',
              p: '6',
            })}
          >
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: '2xs',
                fontWeight: 'medium',
                letterSpacing: 'wide',
                color: 'fg.onAccent',
                bg: 'accent.default',
                px: '2',
                py: '0.5',
                borderRadius: 'xs',
              })}
            >
              {copy.linkCardTag}
            </span>
            <div className={vstack({ gap: '2', alignItems: 'flex-start' })}>
              <h2
                className={css({
                  textStyle: 'heading.h4',
                  color: 'fg.default',
                })}
              >
                {copy.linkCardTitle}
              </h2>
              <p
                className={css({
                  textStyle: 'body.sm',
                  color: 'fg.subtle',
                  whiteSpace: 'pre-line',
                })}
              >
                {copy.linkCardDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={onLink}
              className={cx(
                button({ variant: 'primary', size: 'md' }),
                css({ w: 'full' }),
              )}
              data-testid="steam-link-invite-link"
            >
              {copy.linkLabel}
            </button>
          </div>

          {/* 보조 카드 — 기본 테두리 */}
          <div
            className={vstack({
              gap: '4',
              alignItems: 'flex-start',
              bg: 'bg.subtle',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: '2xl',
              p: '6',
            })}
          >
            <div
              className={vstack({
                gap: '2',
                alignItems: 'flex-start',
                flex: '1',
                justifyContent: 'center',
              })}
            >
              <h2
                className={css({
                  textStyle: 'heading.h4',
                  color: 'fg.default',
                })}
              >
                {copy.skipCardTitle}
              </h2>
              <p
                className={css({
                  textStyle: 'body.sm',
                  color: 'fg.subtle',
                  whiteSpace: 'pre-line',
                })}
              >
                {copy.skipCardDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={onSkip}
              className={cx(
                button({ variant: 'secondary', size: 'md' }),
                css({ w: 'full' }),
              )}
              data-testid="steam-link-invite-skip"
            >
              {copy.skipLabel}
            </button>
          </div>
        </div>

        {/* ③ 하단 benefits 3열(origin별 항목 주입) */}
        <SteamBenefitList items={copy.benefits} />
      </section>
    </main>
  );
}
