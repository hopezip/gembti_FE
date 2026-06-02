import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

export function ProfileHeader({ profile }: Props) {
  const { nickname, handle, joinedAt, avatarUrl, stats, isPublic } = profile;

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
          w: '20',
          h: '20',
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
        })}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={nickname}
            className={css({ w: 'full', h: 'full', objectFit: 'cover' })}
          />
        ) : (
          <span>아바타</span>
        )}
      </div>

      {/* 닉네임 + 핸들 + 통계 */}
      <div className={css({ flex: 1, minW: 0 })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            mb: '1',
          })}
        >
          <span
            className={css({
              fontSize: 'xl',
              fontWeight: 'bold',
              color: 'fg.default',
            })}
          >
            {nickname}
          </span>
          <span
            className={css({
              fontSize: 'xs',
              color: 'accent.fg',
              bg: 'accent.soft',
              px: '2',
              py: '0.5',
              borderRadius: 'sm',
              fontWeight: 'medium',
            })}
          >
            {isPublic ? '공개' : '비공개'}
          </span>
        </div>

        <div
          className={css({
            display: 'flex',
            gap: '3',
            color: 'fg.subtle',
            fontSize: 'sm',
            mb: '4',
          })}
        >
          <span>{handle}</span>
          <span>·</span>
          <span>가입 {joinedAt}</span>
        </div>

        {/* 통계 */}
        <div className={css({ display: 'flex', gap: '6' })}>
          {[
            { label: '팔로우', value: stats.following },
            { label: '팔로워', value: stats.followers },
            {
              label: '총 플레이 시간(H)',
              value: stats.totalPlayHours.toLocaleString(),
            },
            { label: '리뷰', value: stats.reviewCount },
          ].map(({ label, value }) => (
            <div key={label} className={css({ textAlign: 'center' })}>
              <div
                className={css({
                  fontSize: 'lg',
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

      {/* 우측 버튼 영역 */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '2',
          alignItems: 'flex-end',
        })}
      >
        <div className={css({ display: 'flex', gap: '2' })}>
          <button
            type="button"
            className={css({
              px: '3',
              py: '1.5',
              fontSize: 'sm',
              color: 'fg.muted',
              bg: 'transparent',
              border: '1px solid',
              borderColor: 'border.emphasized',
              borderRadius: 'md',
              cursor: 'pointer',
              _hover: { borderColor: 'border.accent', color: 'fg.default' },
            })}
          >
            로그아웃
          </button>
          <button
            type="button"
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
              _hover: { borderColor: 'border.accent' },
            })}
          >
            프로필 편집
          </button>
          <button
            type="button"
            className={css({
              px: '3',
              py: '1.5',
              fontSize: 'sm',
              color: 'fg.muted',
              bg: 'transparent',
              border: '1px solid',
              borderColor: 'border.emphasized',
              borderRadius: 'md',
              cursor: 'pointer',
              _hover: { borderColor: 'border.emphasized', color: 'fg.default' },
            })}
          >
            설정
          </button>
        </div>
      </div>
    </div>
  );
}
