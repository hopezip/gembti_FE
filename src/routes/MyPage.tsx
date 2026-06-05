import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { ProfileHeader } from '@/features/mypage/components/ProfileHeader';
import { BasicInfoCard } from '@/features/mypage/components/BasicInfoCard';
import { SteamConnectCard } from '@/features/mypage/components/SteamConnectCard';
import { PersonalityRadar } from '@/features/mypage/components/PersonalityRadar';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

export function MyPage() {
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: () => ky.get('/api/mypage/profile').json<MockUserProfile>(),
  });

  if (isLoading) {
    return (
      <div className={css({ maxW: '1200px', mx: 'auto', px: '6', py: '8' })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '6',
            pb: '6',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            mb: '6',
          })}
        >
          <div
            className={css({
              w: '20',
              h: '20',
              borderRadius: 'full',
              bg: 'bg.surfaceRaised',
            })}
          />
          <div className={css({ flex: 1 })}>
            <div
              className={css({
                w: '40',
                h: '6',
                bg: 'bg.surfaceRaised',
                borderRadius: 'md',
                mb: '2',
              })}
            />
            <div
              className={css({
                w: '24',
                h: '4',
                bg: 'bg.surfaceRaised',
                borderRadius: 'md',
              })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div
        className={css({
          maxW: '1200px',
          mx: 'auto',
          px: '6',
          py: '8',
          textAlign: 'center',
          color: 'fg.subtle',
        })}
      >
        프로필 정보를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div
      className={css({
        maxW: '1200px',
        mx: 'auto',
        px: '6',
        py: '8',
        display: 'flex',
        flexDirection: 'column',
        gap: '6',
      })}
    >
      <ProfileHeader profile={profile} />

      {/* 3컬럼 동등 크기 */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '4',
          alignItems: 'start',
        })}
      >
        <BasicInfoCard profile={profile} />
        <SteamConnectCard profile={profile} />
        <PersonalityRadar
          personality={profile.personality}
          syncedAt={profile.steamSyncedAt}
        />
      </div>
    </div>
  );
}
