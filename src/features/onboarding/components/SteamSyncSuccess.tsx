import { css, cx } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { button } from 'styled-system/recipes';

// 스팀 동기화 성공 화면(화면4 / Figma 4074:1126).
// 순수 프리젠테이션: 게임 수·네비게이션은 props·콜백으로만. 내부 fetch/navigate 금지.
// success 체크 배지 + 가져온 게임 수(개수 mono) + NEXT STEP 카드(설문 시작 주 CTA / 메인 보조).
// 타이포/간격은 Figma 4074:1126 스펙에 정밀 정렬(헤딩 34px→7xl, 배지 32px→6xl, 설명 14px→body.md).

export interface SteamSyncSuccessProps {
  /** Steam에서 가져온 보유 게임 수. */
  foundGames: number;
  /** 설문 시작(주 CTA) 클릭 콜백. */
  onStartSurvey: () => void;
  /** 건너뛰고 메인으로(보조) 클릭 콜백. */
  onGoMain: () => void;
}

export function SteamSyncSuccess({
  foundGames,
  onStartSurvey,
  onGoMain,
}: SteamSyncSuccessProps) {
  return (
    <main
      className={css({
        minH: '100vh',
        display: 'grid',
        placeItems: 'center',
        bg: 'bg.canvas',
        px: '8',
        // Figma는 콘텐츠를 본문 영역에서 약간 위쪽에 둔다 — 상단 패딩을 더 줘 중심을 끌어올린다.
        py: '20',
      })}
    >
      <section
        className={vstack({ gap: '8', alignItems: 'center', maxW: '560px' })}
      >
        {/* ① success 체크 배지 + "Steam 연동 완료" (Figma 32px·체크링 ~54px) */}
        <div className={hstack({ gap: '4', alignItems: 'center' })}>
          <span
            aria-hidden="true"
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '14',
              h: '14',
              borderRadius: 'full',
              bg: 'success.soft',
              border: '1px solid',
              borderColor: 'success.default',
              color: 'success.fg',
              // Figma 32px — 토큰 스케일(6xl=30) 외 값이라 정밀 일치 위해 직접 지정.
              fontSize: '32px',
              lineHeight: 'none',
            })}
          >
            ✓
          </span>
          <span
            className={css({
              // Figma 32px(42dot Sans Regular) — 토큰 외 값이라 정밀 일치 위해 직접 지정.
              fontSize: '32px',
              fontWeight: 'normal',
              lineHeight: 'tight',
              color: 'fg.default',
            })}
          >
            Steam 연동 완료
          </span>
        </div>

        {/* ② 가져온 게임 수 헤딩(개수 mono) + 설명 */}
        <div className={vstack({ gap: '3', alignItems: 'center' })}>
          <h1
            className={css({
              // Figma 34px(Bold, -0.5) — 토큰 스케일(7xl=36) 외 값이라 정밀 일치 위해 직접 지정.
              fontSize: '34px',
              fontWeight: 'bold',
              letterSpacing: 'tight',
              lineHeight: 'tight',
              color: 'fg.default',
              textAlign: 'center',
            })}
          >
            Steam에서{' '}
            <span className={css({ fontFamily: 'mono', color: 'accent.fg' })}>
              {foundGames}
            </span>
            개 게임을 가져왔어요
          </h1>
          <p
            className={css({
              textStyle: 'body.md',
              color: 'fg.muted',
              textAlign: 'center',
            })}
          >
            플레이 데이터를 바탕으로 1차 성향을 추정했어요. 설문 몇 가지만 더
            답하면 추천 정확도가 크게 올라가요.
          </p>
        </div>

        {/* ③ NEXT STEP 카드 — 설문 시작(주) / 건너뛰고 메인(보조). Figma radius 12·padding 24 */}
        <div
          className={vstack({
            gap: '4',
            alignItems: 'flex-start',
            w: 'full',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.accent',
            borderRadius: '2xl',
            p: '6',
          })}
        >
          {/* eyebrow 수치 — mono + accent (Figma 10px) */}
          <span
            className={css({
              fontFamily: 'mono',
              fontSize: '2xs',
              letterSpacing: 'wide',
              textTransform: 'uppercase',
              color: 'accent.fg',
            })}
          >
            NEXT STEP · 2 / 2
          </span>
          <div className={vstack({ gap: '1.5', alignItems: 'flex-start' })}>
            <h2
              className={css({
                textStyle: 'heading.h4',
                color: 'fg.default',
              })}
            >
              취향 설문으로 마무리하기
            </h2>
            <p
              className={css({
                fontSize: 'sm',
                lineHeight: 'relaxed',
                color: 'fg.subtle',
              })}
            >
              장르 선호·플레이 스타일을 묻는 짧은 설문 (약 2분). 끝나면 6대 성향
              결과와 함께 첫 추천 행이 나와요.
            </p>
          </div>
          <div className={hstack({ gap: '3', w: 'full' })}>
            <button
              type="button"
              onClick={onStartSurvey}
              className={cx(
                button({ variant: 'primary', size: 'md' }),
                css({ flex: '1' }),
              )}
              data-testid="steam-sync-success-start-survey"
            >
              설문 시작 →
            </button>
            <button
              type="button"
              onClick={onGoMain}
              className={cx(
                button({ variant: 'secondary', size: 'md' }),
                css({ flex: '1' }),
              )}
              data-testid="steam-sync-success-go-main"
            >
              건너뛰고 메인으로
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
