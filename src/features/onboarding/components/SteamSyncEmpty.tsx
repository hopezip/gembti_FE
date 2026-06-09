import { css, cx } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { button } from 'styled-system/recipes';

// 스팀 연동은 됐지만 보유 게임이 없는 경우(sync_status='empty') 화면 (STEAM-INTER-FE-006 신규).
// 순수 프리젠테이션: 네비게이션은 콜백으로만. 내부 fetch/navigate 금지.
// 연동 자체는 성공이라 에러(danger)가 아닌 중립(warning) 톤으로 안내하고, 설문 진행을 주 CTA로 둔다.
//   다시 시도는 의미 없다(게임이 없는 상태는 재조회해도 동일) — retry 액션을 두지 않는다.

export interface SteamSyncEmptyProps {
  /** 설문 시작(주 CTA) 클릭 콜백. */
  onStartSurvey: () => void;
  /** 메인으로(보조) 클릭 콜백. */
  onGoMain: () => void;
}

export function SteamSyncEmpty({
  onStartSurvey,
  onGoMain,
}: SteamSyncEmptyProps) {
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
        className={vstack({ gap: '8', alignItems: 'center', maxW: '560px' })}
      >
        {/* ① 안내 아이콘 + 헤딩 + 설명 */}
        <div className={vstack({ gap: '3', alignItems: 'center' })}>
          <span
            aria-hidden="true"
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              w: '20',
              h: '20',
              borderRadius: 'full',
              bg: 'warning.soft',
              border: '1px solid',
              borderColor: 'warning.default',
              color: 'warning.fg',
              fontSize: '4xl',
            })}
          >
            🎮
          </span>
          <h1
            className={css({
              fontSize: '34px',
              fontWeight: 'bold',
              letterSpacing: 'tight',
              lineHeight: 'tight',
              color: 'fg.default',
              textAlign: 'center',
            })}
          >
            연동했지만 게임 기록이 없어요
          </h1>
          <p
            className={css({
              textStyle: 'body.lg',
              color: 'fg.muted',
              textAlign: 'center',
            })}
          >
            Steam 계정은 정상적으로 연동됐지만, 가져올 플레이 게임이 없네요.
            설문으로 진행하면 취향에 맞는 추천을 받을 수 있어요.
          </p>
        </div>

        {/* ② NEXT STEP 카드 — 설문 시작(주) / 메인으로(보조) */}
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
              className={css({ textStyle: 'heading.h4', color: 'fg.default' })}
            >
              취향 설문으로 시작하기
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
              data-testid="steam-sync-empty-start-survey"
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
              data-testid="steam-sync-empty-go-main"
            >
              메인으로
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
