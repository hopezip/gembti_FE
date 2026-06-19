import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { GameCard } from '@/components/ui/GameCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { STEAM_PRIVACY_SETTINGS_URL } from '@/config/steam';
import { getMyLibrary, getMyProfile } from '@/features/mypage/api/mypage';
import type { LibraryGame } from '@/features/mypage/api/mypage';

type LibrarySort = 'recent' | 'oldest';

const SORT_OPTIONS: { key: LibrarySort; label: string }[] = [
  { key: 'recent', label: '최근 플레이순' },
  { key: 'oldest', label: '오래된 순' },
];

const PAGE_SIZE = 12;

function LibraryGameCard({ item }: { item: LibraryGame }) {
  return (
    <GameCard padding="none" interactive>
      <div
        className={css({
          aspectRatio: '16/10',
          bg: 'bg.surfaceRaised',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 'xl',
          borderTopRightRadius: 'xl',
          color: 'fg.subtle',
          fontSize: 'xs',
        })}
        style={
          item.thumbnailUrl
            ? { backgroundImage: `url(${item.thumbnailUrl})` }
            : undefined
        }
      >
        {!item.thumbnailUrl && '커버 없음'}
      </div>
      <div className={css({ px: '3', pt: '2.5', pb: '3' })}>
        <span
          className={css({
            fontSize: 'xs',
            color: 'fg.subtle',
            display: 'block',
            mb: '1',
          })}
        >
          {item.genres.join(' · ')}
        </span>
        <p
          className={css({
            fontWeight: 'semibold',
            color: 'fg.default',
            fontSize: 'sm',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            mb: '1',
          })}
        >
          {item.title}
        </p>
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: '0.5',
          })}
        >
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            ▶ {item.playHours.toFixed(1)}시간
          </span>
          {item.rating !== null && (
            <span
              className={css({
                fontSize: 'xs',
                color: 'warning.fg',
                fontWeight: 'semibold',
              })}
            >
              ★ {item.rating.toFixed(1)}
            </span>
          )}
        </div>
        {item.lastPlayedAt && (
          <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
            {item.lastPlayedAt}
          </span>
        )}
      </div>
    </GameCard>
  );
}

export function LibrarySection() {
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // 전용 엔드포인트가 없어 보유 게임 전체(auth/me steam_library)를 한 번에 받고, 아래 필터/정렬/페이지는 클라에서 처리한다.
  const { data: library, isLoading } = useQuery({
    queryKey: ['mypage', 'library'],
    queryFn: getMyLibrary,
  });

  // 비공개 안내 분기용 — MyPage가 이미 채운 프로필 쿼리를 캐시 재사용한다(추가 호출 없음).
  const { data: profile } = useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: getMyProfile,
  });
  // Steam은 연동됐지만 게임 세부정보가 비공개라 라이브러리를 못 가져온 경우.
  const isLibraryPrivate =
    profile?.steamConnected === true && profile.steamSyncStatus === 'private';

  const allGames = library ?? [];
  const genres = [...new Set(allGames.flatMap((g) => g.genres))].sort();

  // 필터 → 검색 → 정렬(클라이언트).
  const filtered = allGames
    .filter((g) => (genre ? g.genres.includes(genre) : true))
    .filter((g) =>
      search ? g.title.toLowerCase().includes(search.toLowerCase()) : true,
    )
    .sort((a, b) => {
      if (!a.lastPlayedAt && !b.lastPlayedAt) return 0;
      if (!a.lastPlayedAt) return 1;
      if (!b.lastPlayedAt) return -1;
      const cmp = b.lastPlayedAt.localeCompare(a.lastPlayedAt);
      return sort === 'oldest' ? -cmp : cmp;
    });

  const visibleItems = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visibleItems.length < filtered.length;
  const total = allGames.length;

  function handleGenreChange(g: string) {
    setGenre(g);
    setPage(1);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value as LibrarySort);
    setPage(1);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  return (
    <section>
      {/* 헤더 */}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '4',
        })}
      >
        <div
          className={css({ display: 'flex', alignItems: 'baseline', gap: '2' })}
        >
          <h2
            className={css({
              fontSize: 'lg',
              fontWeight: 'bold',
              color: 'fg.default',
            })}
          >
            내 라이브러리
          </h2>
          {library && (
            <span className={css({ fontSize: 'sm', color: 'fg.subtle' })}>
              {total}개
            </span>
          )}
        </div>
      </div>

      {/* 필터 행 */}
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '4',
          gap: '3',
          flexWrap: 'wrap',
          '@media (max-width: 768px)': {
            alignItems: 'stretch',
          },
        })}
      >
        {/* 장르 Chip + 정렬 */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            flexWrap: 'wrap',
            '@media (max-width: 768px)': {
              w: 'full',
              justifyContent: 'space-between',
            },
          })}
        >
          <Chip
            data-state={genre === '' ? 'on' : undefined}
            onClick={() => handleGenreChange('')}
          >
            전체
          </Chip>
          {genres.map((g) => (
            <Chip
              key={g}
              data-state={genre === g ? 'on' : undefined}
              onClick={() => handleGenreChange(g)}
            >
              {g}
            </Chip>
          ))}
          <select
            value={sort}
            onChange={handleSortChange}
            className={css({
              px: '2',
              py: '1',
              fontSize: 'xs',
              color: 'fg.subtle',
              bg: 'bg.surfaceRaised',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 'md',
              cursor: 'pointer',
              outline: 'none',
            })}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 검색 */}
        <form
          onSubmit={handleSearch}
          className={css({
            w: '52',
            '@media (max-width: 768px)': { w: 'full' },
          })}
        >
          <SearchInput
            size="sm"
            className={css({
              '@media (max-width: 768px)': {
                py: '4.5',
              },
            })}
            aria-label="내 라이브러리 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="내 라이브러리에서 검색..."
          />
        </form>
      </div>

      {/* 콘텐츠 */}
      {isLoading ? (
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4',
          })}
        >
          {(['sk1', 'sk2', 'sk3', 'sk4'] as const).map((key) => (
            <div
              key={key}
              className={css({
                aspectRatio: '3/4',
                bg: 'bg.surfaceRaised',
                borderRadius: 'xl',
              })}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        search ? (
          <EmptyState type="search" target={search} />
        ) : isLibraryPrivate ? (
          <EmptyState
            type="party"
            title="게임 세부정보가 비공개예요"
            description="Steam 프로필의 게임 세부정보가 비공개로 설정돼 있어 라이브러리를 가져오지 못했어요. Steam에서 게임 세부정보를 공개로 바꾸면 자동으로 동기화돼요."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  window.open(
                    STEAM_PRIVACY_SETTINGS_URL,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }
              >
                Steam 공개 설정 열기
              </Button>
            }
          />
        ) : (
          <EmptyState
            type="party"
            title="라이브러리가 비어 있어요"
            description="Steam을 연동하면 게임 라이브러리가 자동으로 동기화돼요."
          />
        )
      ) : (
        <>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4',
              mb: '4',
            })}
          >
            {visibleItems.map((item) => (
              <LibraryGameCard key={item.id} item={item} />
            ))}
          </div>
          {hasMore && (
            <div className={css({ textAlign: 'center' })}>
              <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
                더 보기 · {filtered.length - visibleItems.length}개 남음 ↓
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
