import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

export function SteamConnectCard({ profile }: Props) {
  const { steamConnected, steamId, steamNickname, steamSyncedAt } = profile;

  const syncedDate = steamSyncedAt
    ? new Date(steamSyncedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null;

  return (
    <div
      className={css({
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'xl',
        p: '4',
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '3',
        })}
      >
        <span
          className={css({
            fontSize: 'sm',
            fontWeight: 'semibold',
            color: 'fg.default',
          })}
        >
          Steam 연동
        </span>
        <span
          className={css({
            fontSize: 'xs',
            fontWeight: 'semibold',
            color: steamConnected ? 'success.fg' : 'fg.subtle',
            bg: steamConnected ? 'success.soft' : 'bg.surfaceRaised',
            px: '2',
            py: '0.5',
            borderRadius: 'sm',
          })}
        >
          {steamConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>

      {steamConnected && steamId ? (
        <>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              mb: '2',
            })}
          >
            <span
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'fg.default',
              })}
            >
              {steamNickname}
            </span>
            <span
              className={css({
                fontSize: 'xs',
                color: 'info.fg',
                bg: 'info.soft',
                px: '1.5',
                py: '0.5',
                borderRadius: 'sm',
              })}
            >
              Steam 16
            </span>
          </div>

          {syncedDate && (
            <p className={css({ fontSize: 'xs', color: 'fg.subtle', mb: '3' })}>
              최종 동기화 시간 · {syncedDate} 완
            </p>
          )}

          <div className={css({ display: 'flex', gap: '2' })}>
            <button
              type="button"
              className={css({
                flex: 1,
                py: '1.5',
                fontSize: 'xs',
                color: 'fg.default',
                bg: 'bg.surfaceRaised',
                border: '1px solid',
                borderColor: 'border.emphasized',
                borderRadius: 'md',
                cursor: 'pointer',
                _hover: { borderColor: 'accent.default' },
              })}
            >
              수동 동기화
            </button>
            <button
              type="button"
              className={css({
                flex: 1,
                py: '1.5',
                fontSize: 'xs',
                color: 'danger.fg',
                bg: 'transparent',
                border: '1px solid',
                borderColor: 'border.emphasized',
                borderRadius: 'md',
                cursor: 'pointer',
                _hover: { borderColor: 'danger.default' },
              })}
            >
              연동 해제
            </button>
          </div>
        </>
      ) : (
        <div className={css({ textAlign: 'center', py: '4' })}>
          <p className={css({ fontSize: 'sm', color: 'fg.subtle', mb: '3' })}>
            Steam 계정이 연동되지 않았습니다
          </p>
          <button
            type="button"
            className={css({
              px: '4',
              py: '2',
              fontSize: 'sm',
              color: 'fg.onAccent',
              bg: 'accent.default',
              border: 'none',
              borderRadius: 'md',
              cursor: 'pointer',
              _hover: { bg: 'accent.hover' },
            })}
          >
            Steam 연동하기
          </button>
        </div>
      )}
    </div>
  );
}
