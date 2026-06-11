import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import {
  followUser,
  getFollowers,
  getFollowing,
  getMyProfile,
  unfollowUser,
} from '@/features/mypage/api/mypage';
import type { MockFollowUser } from '@/mocks/handlers/mypage';

export function FollowListPage() {
  const [tab, setTab] = useState<'following' | 'followers'>('following');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: getMyProfile,
  });

  const { data: followingData } = useQuery({
    queryKey: ['mypage', 'following'],
    queryFn: getFollowing,
  });

  const { data: followersData } = useQuery({
    queryKey: ['mypage', 'followers'],
    queryFn: getFollowers,
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['mypage', 'followers'] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['mypage', 'followers'] });
    },
  });

  const activeList =
    tab === 'following'
      ? (followingData?.users ?? [])
      : (followersData?.users ?? []);

  const filtered = search.trim()
    ? activeList.filter(
        (u) =>
          u.nickname.includes(search) ||
          u.handle.includes(search) ||
          u.bio.includes(search),
      )
    : activeList;

  const initials = (profile?.nickname ?? 'U').slice(0, 2).toUpperCase();

  return (
    <div className={css({ maxW: '900px', mx: 'auto', px: '6', py: '8' })}>
      {/* 상단 미니 프로필 */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '4',
          pb: '5',
          mb: '5',
          borderBottom: '1px solid',
          borderColor: 'border.default',
        })}
      >
        <div
          className={css({
            w: '14',
            h: '14',
            borderRadius: 'full',
            bg: 'accent.default',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'lg',
            fontWeight: 'bold',
            color: 'white',
            overflow: 'hidden',
          })}
        >
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="avatar"
              className={css({ w: 'full', h: 'full', objectFit: 'cover' })}
            />
          ) : (
            initials
          )}
        </div>
        <div>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1.5',
              mb: '0.5',
            })}
          >
            <span
              className={css({
                fontSize: 'lg',
                fontWeight: 'bold',
                color: 'fg.default',
              })}
            >
              {profile?.nickname ?? '...'}
            </span>
            <span className={css({ fontSize: 'sm', color: '#4A9EFF' })}>✓</span>
          </div>
          <p className={css({ fontSize: 'sm', color: 'fg.subtle', mb: '1' })}>
            @{profile?.handle ?? ''}
          </p>
          <div className={css({ display: 'flex', gap: '4' })}>
            <button
              type="button"
              onClick={() => setTab('following')}
              className={css({
                bg: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                gap: '1',
                alignItems: 'baseline',
              })}
            >
              <span
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  color: tab === 'following' ? 'accent.fg' : 'fg.default',
                })}
              >
                {profile?.stats.following ?? 0}
              </span>
              <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                팔로잉
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab('followers')}
              className={css({
                bg: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                gap: '1',
                alignItems: 'baseline',
              })}
            >
              <span
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  color: tab === 'followers' ? 'accent.fg' : 'fg.default',
                })}
              >
                {profile?.stats.followers ?? 0}
              </span>
              <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                팔로워
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div
        className={css({
          display: 'flex',
          borderBottom: '1px solid',
          borderColor: 'border.default',
          mb: '4',
        })}
      >
        {(['following', 'followers'] as const).map((t) => {
          const label = t === 'following' ? '팔로잉' : '팔로워';
          const count =
            t === 'following'
              ? profile?.stats.following
              : profile?.stats.followers;
          const isActive = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={css({
                px: '4',
                pb: '3',
                fontSize: 'sm',
                fontWeight: isActive ? 'semibold' : 'normal',
                color: isActive ? 'accent.fg' : 'fg.subtle',
                bg: 'transparent',
                border: 'none',
                borderBottom: '2px solid',
                borderColor: isActive ? 'accent.default' : 'transparent',
                cursor: 'pointer',
                mr: '2',
              })}
            >
              {label} {count ?? 0}
            </button>
          );
        })}
      </div>

      {/* 검색 */}
      <div className={css({ position: 'relative', mb: '4' })}>
        <span
          className={css({
            position: 'absolute',
            left: '3',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'fg.subtle',
            fontSize: 'xs',
          })}
        >
          ●
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${tab === 'following' ? '팔로잉' : '팔로워'} 중인 사람 검색…`}
          className={css({
            w: 'full',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 'lg',
            pl: '8',
            pr: '4',
            py: '2.5',
            fontSize: 'sm',
            color: 'fg.default',
            outline: 'none',
            _focus: { borderColor: 'accent.default' },
            _placeholder: { color: 'fg.subtle' },
          })}
        />
      </div>

      {/* 카운트 */}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '3',
        })}
      >
        <span className={css({ fontSize: 'sm', color: 'fg.subtle' })}>
          전체 {filtered.length}명
        </span>
        <button
          type="button"
          className={css({
            fontSize: 'xs',
            color: 'fg.subtle',
            bg: 'transparent',
            border: 'none',
            cursor: 'pointer',
            _hover: { color: 'fg.default' },
          })}
        >
          최신순 ▾
        </button>
      </div>

      {/* 유저 목록 */}
      <div
        className={css({ display: 'flex', flexDirection: 'column', gap: '0' })}
      >
        {filtered.length === 0 ? (
          <p
            className={css({
              py: '12',
              textAlign: 'center',
              fontSize: 'sm',
              color: 'fg.subtle',
            })}
          >
            {search ? '검색 결과가 없습니다' : '아직 없습니다'}
          </p>
        ) : (
          filtered.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onFollow={() => followMutation.mutate(user.id)}
              onUnfollow={() => unfollowMutation.mutate(user.id)}
              isPending={followMutation.isPending || unfollowMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  onFollow,
  onUnfollow,
  isPending,
}: {
  user: MockFollowUser;
  onFollow: () => void;
  onUnfollow: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '3',
        py: '4',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        _last: { borderBottom: 'none' },
      })}
    >
      {/* 아바타 */}
      <div
        style={{ backgroundColor: user.avatarColor }}
        className={css({
          w: '11',
          h: '11',
          borderRadius: 'full',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'sm',
          fontWeight: 'bold',
          color: 'white',
        })}
      >
        {user.nickname.slice(0, 2).toUpperCase()}
      </div>

      {/* 정보 */}
      <div className={css({ flex: 1, minW: 0 })}>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            mb: '0.5',
          })}
        >
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'fg.default',
            })}
          >
            {user.nickname}
          </span>
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            @{user.handle}
          </span>
          {user.isMutualFollow && (
            <span
              className={css({
                fontSize: 'xs',
                px: '1.5',
                py: '0.5',
                bg: 'bg.surfaceRaised',
                color: 'fg.subtle',
                borderRadius: 'sm',
                border: '1px solid',
                borderColor: 'border.default',
              })}
            >
              맞팔로우
            </span>
          )}
        </div>
        <p
          className={css({
            fontSize: 'xs',
            color: 'fg.muted',
            mb: '1.5',
            lineHeight: '1.5',
          })}
        >
          {user.bio}
        </p>
        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '1' })}>
          {user.genres.map((g) => (
            <span
              key={g}
              className={css({
                fontSize: 'xs',
                px: '2',
                py: '0.5',
                bg: 'bg.surfaceRaised',
                color: 'fg.subtle',
                borderRadius: 'full',
                border: '1px solid',
                borderColor: 'border.default',
              })}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* 팔로잉/팔로우 버튼 */}
      <button
        type="button"
        onClick={user.isFollowing ? onUnfollow : onFollow}
        disabled={isPending}
        className={css({
          px: '4',
          py: '1.5',
          fontSize: 'sm',
          fontWeight: 'medium',
          color: user.isFollowing ? 'fg.subtle' : 'white',
          bg: user.isFollowing ? 'transparent' : 'accent.default',
          border: '1px solid',
          borderColor: user.isFollowing
            ? 'border.emphasized'
            : 'accent.default',
          borderRadius: 'md',
          cursor: 'pointer',
          flexShrink: 0,
          _hover: {
            borderColor: 'accent.default',
            color: user.isFollowing ? 'accent.fg' : 'white',
          },
          _disabled: { opacity: '0.5', cursor: 'not-allowed' },
        })}
      >
        {user.isFollowing ? '팔로잉' : '팔로우'}
      </button>
    </div>
  );
}
