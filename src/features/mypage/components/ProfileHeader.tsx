import { useNavigate } from 'react-router-dom';
import { css } from 'styled-system/css';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

export function ProfileHeader({ profile }: Props) {
  const { nickname, avatarUrl, stats } = profile;
  const navigate = useNavigate();

  const statItems = [
    { label: '보유', value: stats.following },
    { label: '플레이중', value: stats.followers },
    {
      label: '총 플레이 시간(시간)',
      value: stats.totalPlayHours.toLocaleString(),
    },
    { label: '리뷰', value: stats.reviewCount },
  ];

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6',
        pb: '6',
        borderBottom: '1px solid',
        borderColor: 'border.default',
      })}
    >
      <Avatar size="xl" src={avatarUrl ?? undefined} name={nickname} />

      <div className={css({ flex: 1, minW: 0 })}>
        <p
          className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'fg.default',
            mb: '4',
          })}
        >
          {nickname}
        </p>
        <div className={css({ display: 'flex', gap: '8' })}>
          {statItems.map(({ label, value }) => (
            <div key={label} className={css({ textAlign: 'center' })}>
              <div
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'fg.default',
                })}
              >
                {value}
              </div>
              <div className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/mypage/edit')}
      >
        프로필 편집
      </Button>
    </div>
  );
}
