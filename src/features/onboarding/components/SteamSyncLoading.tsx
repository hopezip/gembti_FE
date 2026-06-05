import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';

// 스팀 라이브러리 동기화 진행 화면(화면3 / Figma 4074:995).
// 순수 프리젠테이션: 경과초·취소는 props·콜백으로만. 내부 폴링/navigate 금지.
// accent 스피너 + "Steam 라이브러리 읽는 중…" 헤딩 + "평균 10~30초" mono 안내 + 취소 버튼.

export interface SteamSyncLoadingProps {
  /** 폴링 시작 후 경과 초(표시용). */
  elapsedSeconds: number;
  /** 취소 클릭 콜백. */
  onCancel: () => void;
}

export function SteamSyncLoading({
  elapsedSeconds,
  onCancel,
}: SteamSyncLoadingProps) {
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
        className={vstack({ gap: '6', alignItems: 'center', maxW: '420px' })}
      >
        {/* accent 회전 스피너 — border 일부만 accent로 두고 회전 */}
        <span
          aria-hidden="true"
          className={css({
            w: '14',
            h: '14',
            borderRadius: 'full',
            border: '3px solid',
            borderColor: 'border.default',
            borderTopColor: 'accent.default',
            // Park UI preset 제공 keyframe(animations.spin) 사용 — 신규 keyframe 정의 금지.
            animation: 'spin',
          })}
        />

        <div className={vstack({ gap: '2', alignItems: 'center' })}>
          <h2
            className={css({
              textStyle: 'heading.h3',
              color: 'fg.default',
              textAlign: 'center',
            })}
          >
            Steam 라이브러리 읽는 중…
          </h2>
          <p
            className={css({
              textStyle: 'body.sm',
              color: 'fg.muted',
              textAlign: 'center',
            })}
          >
            Steam에서 보유 게임과 플레이 시간을 가져오고 있어요. 잠시만
            기다려주세요
          </p>
          {/* 수치(평균 시간·경과초)는 mono + fg.subtle */}
          <p
            className={css({
              fontFamily: 'mono',
              fontSize: 'xs',
              letterSpacing: 'wide',
              color: 'fg.subtle',
            })}
          >
            평균 10~30초 · 경과 {elapsedSeconds}초
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className={css({
            px: '5',
            py: '2',
            textStyle: 'body.sm',
            color: 'fg.subtle',
            bg: 'transparent',
            border: '1px solid',
            borderColor: 'border.emphasized',
            borderRadius: 'md',
            cursor: 'pointer',
            transition: 'all {durations.fast} {easings.standard}',
            _hover: { bg: 'bg.surface', color: 'fg.default' },
            _focusVisible: { outline: 'none', boxShadow: 'focusRing' },
          })}
          data-testid="steam-sync-loading-cancel"
        >
          취소
        </button>
      </section>
    </main>
  );
}
