import { useLocation } from 'react-router-dom';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { Tag } from '@/components/ui/Tag';
import { STEAM_AUTH_START_URL } from '@/config/steam';
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

  const startSteamLink = () => {
    setSteamLinkAuthIntent('/mypage');
    window.location.assign(STEAM_AUTH_START_URL);
  };

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
