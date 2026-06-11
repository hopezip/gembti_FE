import { useQuery } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import { button } from 'styled-system/recipes';
import { getMyProfile } from '@/features/mypage/api/mypage';
import { ProfileHeader } from '@/features/mypage/components/ProfileHeader';
import { BasicInfoCard } from '@/features/mypage/components/BasicInfoCard';
import { SteamConnectCard } from '@/features/mypage/components/SteamConnectCard';
import { PersonalityRadar } from '@/features/mypage/components/PersonalityRadar';
import { LibrarySection } from '@/features/mypage/components/LibrarySection';

export function MyPage() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: getMyProfile,
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
        className={vstack({
          maxW: '1200px',
          mx: 'auto',
          px: '6',
          py: '20',
          gap: '4',
          alignItems: 'center',
          color: 'fg.subtle',
        })}
      >
        <p>프로필 정보를 불러올 수 없습니다</p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className={button({ variant: 'primary', size: 'sm' })}
        >
          {isFetching ? '불러오는 중…' : '다시 시도'}
        </button>
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
          alignItems: 'stretch',
        })}
      >
        <BasicInfoCard profile={profile} />
        <SteamConnectCard profile={profile} />
        <PersonalityRadar personality={profile.personality} />
      </div>

      <LibrarySection />
    </div>
  );
}
