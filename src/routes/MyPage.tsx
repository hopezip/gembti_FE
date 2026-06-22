import { useQuery } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { PageContainer } from '@/components/layout/PageContainer';
import { getMyProfile } from '@/features/mypage/api/mypage';
import { ProfileHeader } from '@/features/mypage/components/ProfileHeader';
import { BasicInfoCard } from '@/features/mypage/components/BasicInfoCard';
import { SteamConnectCard } from '@/features/mypage/components/SteamConnectCard';
import { PersonalityRadar } from '@/features/mypage/components/PersonalityRadar';
import { LibrarySection } from '@/features/mypage/components/LibrarySection';
import { WithdrawalSection } from '@/features/mypage/components/WithdrawalSection';

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
      <PageContainer className={css({ py: '8' })}>
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
      </PageContainer>
    );
  }

  if (isError || !profile) {
    return (
      <PageContainer
        className={css({
          py: '20',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4',
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
      </PageContainer>
    );
  }

  return (
    <PageContainer
      className={css({
        py: '8',
        display: 'flex',
        flexDirection: 'column',
        gap: '6',
      })}
    >
      <ProfileHeader profile={profile} />

      {/* PC: 3열 / 태블릿(≤1024px): 기본정보 상단 풀폭 + 하단 2열 / 모바일(≤768px): 1열 */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '4',
          alignItems: 'stretch',
          '& > *': { minWidth: 0 },
          '@media (max-width: 1024px)': {
            gridTemplateColumns: '1fr 1fr',
            '& > *:first-child': { gridColumn: '1 / -1' },
          },
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
          },
        })}
      >
        <BasicInfoCard profile={profile} />
        <SteamConnectCard profile={profile} />
        <PersonalityRadar personality={profile.personality} />
      </div>

      <LibrarySection />

      <WithdrawalSection loginProvider={profile.loginProvider} />
    </PageContainer>
  );
}
