import { css, cx } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { button } from 'styled-system/recipes';

// 스팀 동기화 실패/타임아웃 화면(화면6 / Figma 4077:1351). FAILED·TIMEOUT 공용.
// 순수 프리젠테이션: 네비게이션은 콜백으로만. 내부 fetch/navigate 금지.
// danger ! 아이콘 + "Steam 정보를 불러오지 못했어요" + 원인 3박스(서버지연/권한제한/시간초과)
//   + 하단 '다시 시도'(accent) / '설문으로 진행'(보조).

export interface SteamSyncErrorProps {
  /** 다시 시도(주 CTA) 클릭 콜백. */
  onRetry: () => void;
  /** 설문으로 진행(보조) 클릭 콜백. */
  onSkipToSurvey: () => void;
}

// 실패 원인 3박스(Figma 원문).
const CAUSES = [
  { icon: '🌐', text: 'Steam 서버 지연\n또는 일시적 오류' },
  { icon: '🔒', text: '권한이 부족했거나\n접속이 제한됨' },
  { icon: '⏱', text: '요청 시간이\n초과되었을 수 있어요' },
];

export function SteamSyncError({
  onRetry,
  onSkipToSurvey,
}: SteamSyncErrorProps) {
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
        className={vstack({ gap: '6', alignItems: 'center', maxW: '560px' })}
      >
        {/* ① danger ! 아이콘 + 헤딩 + 설명 */}
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
              bg: 'danger.soft',
              border: '1px solid',
              borderColor: 'danger.default',
              color: 'danger.fg',
              fontSize: '4xl',
              fontWeight: 'light',
            })}
          >
            !
          </span>
          <h1
            className={css({
              // Figma 34px — 토큰 외 값이라 정밀 일치 위해 직접 지정.
              fontSize: '34px',
              fontWeight: 'bold',
              letterSpacing: 'tight',
              lineHeight: 'tight',
              color: 'fg.default',
              textAlign: 'center',
            })}
          >
            Steam 정보를 불러오지 못했어요
          </h1>
          <p
            className={css({
              textStyle: 'body.lg',
              color: 'fg.muted',
              textAlign: 'center',
            })}
          >
            일시적인 오류일 수 있어요. 잠시 후 다시 시도하거나, 설문으로
            진행하실 수 있어요.
          </p>
        </div>

        {/* ② 원인 3박스 */}
        <div
          className={vstack({
            gap: '4',
            alignItems: 'stretch',
            w: 'full',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: '2xl',
            p: '6',
          })}
        >
          <div className={hstack({ gap: '2', alignItems: 'center' })}>
            <span aria-hidden="true" className={css({ color: 'danger.fg' })}>
              ⚠
            </span>
            <h2
              className={css({
                fontSize: '2xl',
                fontWeight: 'medium',
                lineHeight: 'snug',
                color: 'fg.default',
              })}
            >
              문제가 발생할 수 있는 경우
            </h2>
          </div>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4',
            })}
          >
            {CAUSES.map((cause) => (
              <div
                key={cause.text}
                className={vstack({ gap: '2', alignItems: 'center' })}
              >
                <span
                  aria-hidden="true"
                  className={css({ fontSize: '2xl', color: 'danger.fg' })}
                >
                  {cause.icon}
                </span>
                <span
                  className={css({
                    textStyle: 'body.lg',
                    color: 'fg.subtle',
                    textAlign: 'center',
                    whiteSpace: 'pre-line',
                  })}
                >
                  {cause.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ③ 하단 액션: 다시 시도(주) / 설문으로 진행(보조) */}
        <div className={hstack({ gap: '3', w: 'full' })}>
          <button
            type="button"
            onClick={onRetry}
            className={cx(
              button({ variant: 'primary', size: 'lg' }),
              css({ flex: '1' }),
            )}
            data-testid="steam-sync-error-retry"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={onSkipToSurvey}
            className={cx(
              button({ variant: 'secondary', size: 'lg' }),
              css({ flex: '1' }),
            )}
            data-testid="steam-sync-error-skip"
          >
            설문으로 진행 →
          </button>
        </div>
      </section>
    </main>
  );
}
