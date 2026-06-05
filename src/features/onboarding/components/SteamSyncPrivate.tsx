import { css, cx } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';
import { button } from 'styled-system/recipes';

// 스팀 라이브러리 비공개 화면(화면5 / Figma 4074:1202).
// 순수 프리젠테이션: 네비게이션은 콜백으로만. 내부 fetch/navigate 금지.
// warning 경고 아이콘 + "라이브러리가 비공개..." + 방법1(프로필 공개 4스텝) / 방법2(설문 진행)
//   + 하단 '다시 시도'(accent) / '설문으로 진행'(보조).

export interface SteamSyncPrivateProps {
  /** 다시 시도(주 CTA) 클릭 콜백. */
  onRetry: () => void;
  /** 설문으로 진행(보조) 클릭 콜백. */
  onSkipToSurvey: () => void;
}

// 방법1 프로필 공개 가이드 4스텝(Figma 원문).
const STEPS = [
  'Steam 우상단 닉네임 클릭 → 프로필',
  '오른쪽 프로필 편집 → 개인정보 보호 설정',
  '내 프로필 · 게임 세부 정보 를 모두 공개로 변경',
  '저장 후 아래 다시 시도 버튼 클릭',
];

export function SteamSyncPrivate({
  onRetry,
  onSkipToSurvey,
}: SteamSyncPrivateProps) {
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
        className={vstack({ gap: '6', alignItems: 'center', maxW: '720px' })}
      >
        {/* ① warning 경고 아이콘 + 헤딩(34px) + 설명 */}
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
            ⚠
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
            라이브러리가 비공개로 설정되어 있어요
          </h1>
          <p
            className={css({
              fontSize: 'md',
              lineHeight: 'relaxed',
              color: 'fg.muted',
              textAlign: 'center',
              maxW: '600px',
            })}
          >
            Steam 계정은 정상적으로 인증됐어요. 하지만 프로필 또는 게임
            세부정보가 비공개라서 라이브러리를 가져올 수 없네요. 두 가지 방법이
            있어요 — Steam 설정을 공개로 바꾸거나, 설문으로 진행할 수 있어요.
          </p>
        </div>

        {/* ② 방법1: 프로필 공개 4스텝 가이드 */}
        <div
          className={vstack({
            gap: '4',
            alignItems: 'stretch',
            w: 'full',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: '2xl',
            p: '8',
          })}
        >
          <div className={hstack({ gap: '3', alignItems: 'center' })}>
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: 'sm',
                fontWeight: 'bold',
                color: 'accent.fg',
                border: '1px solid',
                borderColor: 'border.accent',
                borderRadius: 'sm',
                px: '3',
                py: '1',
              })}
            >
              방법 1
            </span>
            <div className={vstack({ gap: '0.5', alignItems: 'flex-start' })}>
              <h2
                className={css({
                  textStyle: 'heading.h3',
                  color: 'fg.default',
                })}
              >
                Steam에서 프로필을 공개로 변경
              </h2>
              <p className={css({ textStyle: 'body.lg', color: 'fg.subtle' })}>
                아래 순서대로 설정을 변경하면 라이브러리를 가져올 수 있어요.
              </p>
            </div>
          </div>

          <ol
            className={vstack({
              gap: '2.5',
              alignItems: 'stretch',
              listStyle: 'none',
            })}
          >
            {STEPS.map((step, i) => (
              <li
                key={step}
                className={hstack({
                  gap: '3',
                  alignItems: 'center',
                  bg: 'bg.subtle',
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 'lg',
                  p: '4',
                })}
              >
                {/* 스텝 번호 배지 */}
                <span
                  aria-hidden="true"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    w: '6',
                    h: '6',
                    borderRadius: 'full',
                    bg: 'accent.default',
                    color: 'fg.onAccent',
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    fontWeight: 'bold',
                  })}
                >
                  {i + 1}
                </span>
                <span
                  className={css({ textStyle: 'body.lg', color: 'fg.muted' })}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* ③ 방법2: 설문 진행 안내 */}
        <div
          className={vstack({
            gap: '2',
            alignItems: 'flex-start',
            w: 'full',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: '2xl',
            p: '8',
          })}
        >
          <div className={hstack({ gap: '3', alignItems: 'center' })}>
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: 'sm',
                fontWeight: 'bold',
                color: 'accent.fg',
                border: '1px solid',
                borderColor: 'border.accent',
                borderRadius: 'sm',
                px: '3',
                py: '1',
              })}
            >
              방법 2
            </span>
            <h2
              className={css({ textStyle: 'heading.h3', color: 'fg.default' })}
            >
              설문으로 진행 (Steam 데이터 없이)
            </h2>
          </div>
          <p className={css({ textStyle: 'body.lg', color: 'fg.subtle' })}>
            공개 설정을 원치 않으시면 설문만으로도 추천을 받을 수 있어요.
            ONLY_SURVEY 모드에서는 설문 응답을 기반으로 맞춤 추천을 제공해요.
          </p>
        </div>

        {/* ④ 하단 액션: 다시 시도(주) / 설문으로 진행(보조) */}
        <div className={hstack({ gap: '3', w: 'full' })}>
          <button
            type="button"
            onClick={onRetry}
            className={cx(
              button({ variant: 'primary', size: 'lg' }),
              css({ flex: '1' }),
            )}
            data-testid="steam-sync-private-retry"
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
            data-testid="steam-sync-private-skip"
          >
            설문으로 진행 →
          </button>
        </div>
      </section>
    </main>
  );
}
