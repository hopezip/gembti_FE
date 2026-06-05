import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

export function ProfileHeader({ profile }: Props) {
  const {
    nickname,
    handle,
    birthdate,
    joinedAt,
    avatarUrl,
    stats,
    isPublic,
    favoriteGenres,
  } = profile;
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  const [publicToggle, setPublicToggle] = useState(isPublic);

  const toggleMutation = useMutation({
    mutationFn: (val: boolean) =>
      ky
        .patch('/api/mypage/profile', { json: { isPublic: val } })
        .json<MockUserProfile>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['mypage', 'profile'], updated);
    },
  });

  function handleToggle() {
    const next = !publicToggle;
    setPublicToggle(next);
    toggleMutation.mutate(next);
  }

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  const initials = nickname.slice(0, 2).toUpperCase();
  // birthdate 연도.월 형식 (1995.05.14 → 1995.05)
  const birthdateShort = birthdate ? birthdate.slice(0, 7) : '';

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

      {/* 닉네임 + 정보 + 통계 */}
      <div className={css({ flex: 1, minW: 0 })}>
        {/* 닉네임 + 장르 배지 */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            mb: '1.5',
          })}
        >
          <span
            className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              color: 'fg.default',
            })}
          >
            {nickname}
          </span>
          {favoriteGenres.slice(0, 1).map((g) => (
            <span
              key={g}
              className={css({
                fontSize: 'xs',
                px: '2',
                py: '0.5',
                bg: 'transparent',
                color: 'accent.fg',
                border: '1px solid',
                borderColor: 'accent.default',
                borderRadius: 'full',
              })}
            >
              {g}
            </span>
          ))}
        </div>

        {/* 핸들 · 생년월일 · 가입일 */}
        <div
          className={css({
            display: 'flex',
            gap: '1.5',
            color: 'fg.subtle',
            fontSize: 'sm',
            mb: '4',
            alignItems: 'center',
          })}
        >
          <span>@{handle}</span>
          {birthdateShort && (
            <>
              <span>·</span>
              <span>{birthdateShort}</span>
            </>
          )}
          <span>·</span>
          <span>가입 {joinedAt}</span>
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

      {/* 우측: 공개 토글 + 버튼 */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          alignItems: 'flex-end',
        })}
      >
        {/* 공개 토글 */}
        <div
          className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
        >
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            유저페이지 공개
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={publicToggle}
            onClick={handleToggle}
            className={css({
              w: '10',
              h: '5',
              borderRadius: 'full',
              bg: publicToggle ? 'accent.default' : 'bg.surfaceRaised',
              border: '1px solid',
              borderColor: publicToggle
                ? 'accent.default'
                : 'border.emphasized',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            })}
          >
            <span
              className={css({
                position: 'absolute',
                top: '0.5',
                w: '3.5',
                h: '3.5',
                borderRadius: 'full',
                bg: 'white',
                transition: 'left 0.2s',
              })}
              style={{ left: publicToggle ? '20px' : '2px' }}
            />
          </button>
        </div>

        {/* 버튼들 */}
        <div className={css({ display: 'flex', gap: '2' })}>
          <button
            type="button"
            onClick={handleLogout}
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
              _hover: { borderColor: 'danger.default', color: 'danger.fg' },
            })}
          >
            로그아웃
          </button>
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
              _hover: { color: 'fg.default' },
            })}
          >
            설정
          </button>
        </div>
      </div>
    </div>
  );
}
