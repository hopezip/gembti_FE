import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { Tag } from '@/components/ui/Tag';
import { toaster } from '@/components/ui/Toast';
import { STEAM_AUTH_START_URL } from '@/config/steam';
import { syncSteam, unlinkSteam } from '@/features/mypage/api/mypage';
import { setSteamLinkAuthIntent } from '@/features/onboarding/lib/steamAuthIntent';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

// 스팀 OpenID 복귀 결과 — SteamCallbackPage가 navigate state로 전달한다(STEAM-INTER-FE-009).
//   토스트는 금방 사라져 사용자가 놓치므로, 버튼 옆에 영구 인라인 텍스트로 결과를 명시한다.
export type SteamLinkStatus = 'success' | 'already_linked' | 'failed';

const STEAM_LINK_STATUS_MESSAGE: Record<SteamLinkStatus, string> = {
  success: 'Steam 계정이 연동됐어요.',
  already_linked: '이미 다른 계정에 연동된 Steam 계정이에요.',
  failed: 'Steam 인증에 실패했어요. 다시 시도해주세요.',
};

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
  const location = useLocation();
  const linkStatus = (location.state as { steamLinkStatus?: SteamLinkStatus })
    ?.steamLinkStatus;
  const queryClient = useQueryClient();
  // 연동 해제 확인 단계(WithdrawalSection과 동일한 인라인 확인 패턴, 별도 모달 컴포넌트 없음).
  const [confirming, setConfirming] = useState(false);

  const startSteamLink = () => {
    setSteamLinkAuthIntent('/mypage');
    window.location.assign(STEAM_AUTH_START_URL);
  };

  // 라이브러리 수동 재동기화 — 성공 시 프로필/라이브러리를 재조회해 최신 보유 게임을 반영한다.
  const resync = useMutation({
    mutationFn: syncSteam,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'library'] }),
      ]);
      toaster.create({
        type: 'success',
        title: '라이브러리를 다시 불러왔어요',
      });
    },
    onError: () => {
      toaster.create({
        type: 'error',
        title: '라이브러리 재동기화에 실패했어요',
        description: '잠시 후 다시 시도해주세요.',
      });
    },
  });

  // 연동 해제 — 성공 시 프로필/라이브러리를 재조회해 auth/me 실값 기준으로 갱신한다.
  const disconnect = useMutation({
    mutationFn: unlinkSteam,
    onSuccess: async () => {
      setConfirming(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] }),
        queryClient.invalidateQueries({ queryKey: ['mypage', 'library'] }),
      ]);
      toaster.create({
        type: 'success',
        title: 'Steam 연동을 해제했어요',
        description: '연동된 라이브러리 정보가 사라집니다.',
      });
    },
    onError: () => {
      toaster.create({
        type: 'error',
        title: 'Steam 연동 해제에 실패했어요',
        description: '잠시 후 다시 시도해주세요.',
      });
    },
  });

  return (
    <Card padding="md" className={css({ h: 'full' })}>
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

          {/* 액션 버튼들 (재동기화 / 연동 해제) */}
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '2',
            })}
          >
            {/* 라이브러리 재동기화 — 보유 게임을 최신으로 다시 불러온다. */}
            {!confirming && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => resync.mutate()}
                disabled={resync.isPending}
              >
                {resync.isPending ? '동기화 중...' : '라이브러리 재동기화'}
              </Button>
            )}

            {/* 연동 해제 — Steam 소셜로그인 계정은 해제 불가(백엔드 정책)라 버튼을 노출하지 않는다.
                email 가입 + Steam 연동 계정만 해제할 수 있다. */}
            {profile.loginProvider !== 'steam' &&
              (!confirming ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirming(true)}
                >
                  연동 해제
                </Button>
              ) : (
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3',
                    p: '3',
                    bg: 'bg.surfaceRaised',
                    borderRadius: 'lg',
                  })}
                >
                  <p className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                    Steam 연동을 해제하면 연동된 라이브러리 정보가 사라집니다.
                  </p>
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '2',
                    })}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirming(false)}
                      disabled={disconnect.isPending}
                    >
                      취소
                    </Button>
                    <Button
                      variant="dangerSolid"
                      size="sm"
                      onClick={() => disconnect.mutate()}
                      disabled={disconnect.isPending}
                    >
                      {disconnect.isPending ? '해제 중...' : '연동 해제'}
                    </Button>
                  </div>
                </div>
              ))}
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
          <Button variant="primary" size="sm" onClick={startSteamLink}>
            Steam 연동하기
          </Button>
        </div>
      )}

      {linkStatus && (
        <p
          role="status"
          className={css({
            mt: '3',
            fontSize: 'xs',
            textAlign: 'center',
            color: linkStatus === 'success' ? 'success.fg' : 'danger.fg',
          })}
        >
          {STEAM_LINK_STATUS_MESSAGE[linkStatus]}
        </p>
      )}
    </Card>
  );
}
