import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor(diff / 60_000);
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

export function SteamConnectCard({ profile }: Props) {
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: () => ky.post('/api/mypage/steam/sync').json<MockUserProfile>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['mypage', 'profile'], updated);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      ky.post('/api/mypage/steam/disconnect').json<MockUserProfile>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['mypage', 'profile'], updated);
    },
  });

  const isSyncing = syncMutation.isPending;

  return (
    <div
      className={css({
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'xl',
        p: '5',
      })}
    >
      {/* 헤더 */}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '4',
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
        {profile.steamConnected && (
          <span
            className={css({
              fontSize: 'xs',
              px: '2',
              py: '0.5',
              color: 'accent.fg',
              border: '1px solid',
              borderColor: 'accent.default',
              borderRadius: 'full',
            })}
          >
            CONNECTED
          </span>
        )}
      </div>

      {profile.steamConnected && profile.steamId ? (
        <>
          {/* Steam 계정 정보 */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '3',
              mb: '4',
              p: '3',
              bg: 'bg.surfaceRaised',
              borderRadius: 'lg',
            })}
          >
            <div
              className={css({
                w: '10',
                h: '10',
                borderRadius: 'md',
                bg: 'bg.canvas',
                border: '1px solid',
                borderColor: 'border.default',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'xs',
                color: 'fg.subtle',
              })}
            >
              아바타
            </div>
            <div>
              <p
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'fg.default',
                })}
              >
                {profile.steamId}
              </p>
              <p className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                최종 동기화 시간:{' '}
                {profile.steamSyncedAt
                  ? relativeTime(profile.steamSyncedAt)
                  : '없음'}
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className={css({ display: 'flex', gap: '2', mb: '3' })}>
            <button
              type="button"
              onClick={() => syncMutation.mutate()}
              disabled={isSyncing}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1.5',
                px: '3',
                py: '2',
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'white',
                bg: 'danger.default',
                border: 'none',
                borderRadius: 'md',
                cursor: 'pointer',
                _hover: { opacity: '0.9' },
                _disabled: { opacity: '0.7', cursor: 'not-allowed' },
              })}
            >
              {isSyncing ? (
                <>
                  <style>{`@keyframes gambti-spin { to { transform: rotate(360deg); } }`}</style>
                  <span
                    style={{
                      display: 'inline-block',
                      animation: 'gambti-spin 0.8s linear infinite',
                    }}
                  >
                    ↻
                  </span>
                  재갱신 중...
                </>
              ) : (
                <>↻ 수동 재갱신</>
              )}
            </button>
            <button
              type="button"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className={css({
                px: '3',
                py: '2',
                fontSize: 'sm',
                color: 'fg.subtle',
                bg: 'transparent',
                border: '1px solid',
                borderColor: 'border.emphasized',
                borderRadius: 'md',
                cursor: 'pointer',
                _hover: { borderColor: 'danger.default', color: 'danger.fg' },
                _disabled: { opacity: '0.5', cursor: 'not-allowed' },
              })}
            >
              연동 해제
            </button>
          </div>

          <p
            className={css({
              fontSize: '11px',
              color: 'fg.subtle',
              fontFamily: 'mono',
            })}
          >
            USER-1 · Steam 닉/아바타/허브 동기화/재갱신
          </p>
        </>
      ) : (
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3',
            py: '6',
          })}
        >
          <p
            className={css({
              fontSize: 'sm',
              color: 'fg.subtle',
              textAlign: 'center',
            })}
          >
            Steam 계정이 연동되지 않았습니다
          </p>
          <button
            type="button"
            className={css({
              px: '4',
              py: '2',
              fontSize: 'sm',
              color: 'white',
              bg: 'accent.default',
              border: 'none',
              borderRadius: 'md',
              cursor: 'pointer',
              _hover: { opacity: '0.9' },
            })}
          >
            Steam 연동하기
          </button>
        </div>
      )}
    </div>
  );
}
