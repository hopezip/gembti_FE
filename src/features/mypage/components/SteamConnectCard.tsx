import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
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
        {profile.steamConnected && <Tag tone="party">CONNECTED</Tag>}
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
            <Button
              variant="dangerSolid"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={isSyncing}
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
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              연동 해제
            </Button>
          </div>
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
          <Button variant="primary" size="sm">
            Steam 연동하기
          </Button>
        </div>
      )}
    </div>
  );
}
