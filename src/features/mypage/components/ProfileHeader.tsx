import { useNavigate } from 'react-router-dom';
import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

export function ProfileHeader({ profile }: Props) {
  const { nickname, avatarUrl, stats } = profile;
  const navigate = useNavigate();

  const initials = nickname.slice(0, 2).toUpperCase();

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
      {/* 아바타 */}
      <div
        className={css({
          w: '24',
          h: '24',
          borderRadius: 'full',
          bg: 'bg.surfaceRaised',
          border: '2px solid',
          borderColor: 'border.emphasized',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'fg.subtle',
          fontSize: 'xs',
          overflow: 'hidden',
          flexDirection: 'column',
          gap: '0.5',
        })}
      >
        {avatarUrl ? (
          // biome-ignore lint/performance/noImgElement: 아바타는 외부 URL로 next/image 도메인 설정 불가
          <img
            src={avatarUrl}
            alt={nickname}
            className={css({ w: 'full', h: 'full', objectFit: 'cover' })}
          />
        ) : (
          <>
            <span>{initials}</span>
            <span className={css({ fontSize: '9px', color: 'fg.subtle' })}>
              아바타 이미지
            </span>
          </>
        )}
      </div>

      {/* 닉네임 + 통계 */}
      <div className={css({ flex: 1, minW: 0 })}>
        <div className={css({ mb: '4' })}>
          <span
            className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'fg.default',
            })}
          >
            {nickname}
          </span>
        </div>

        {/* 통계 */}
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

      {/* 우측: 버튼 */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        })}
      >
        <button
          type="button"
          onClick={() => navigate('/mypage/edit')}
          className={css({
            px: '3',
            py: '1.5',
            fontSize: 'sm',
            color: 'fg.default',
            bg: 'bg.surfaceRaised',
            border: '1px solid',
            borderColor: 'border.emphasized',
            borderRadius: 'md',
            cursor: 'pointer',
            _hover: { borderColor: 'accent.default' },
          })}
        >
          프로필 편집
        </button>
      </div>
    </div>
  );
}
