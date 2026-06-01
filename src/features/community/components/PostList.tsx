import { css } from 'styled-system/css';
import { MOCK_POSTS, MOCK_REMAINING_COUNT } from '../mockPosts';
import { PostCard } from './PostCard';

// 게시글 목록 컨테이너 + expand 버튼 (Figma: post-list + expand)
export function PostList() {
  const posts = MOCK_POSTS;
  const lastIdx = posts.length - 1;

  return (
    <div
      className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}
    >
      {/* post-list 컨테이너 */}
      <div>
        {posts.map((post, idx) => (
          <PostCard
            key={post.id}
            post={post}
            isFirst={idx === 0}
            isLast={idx === lastIdx}
          />
        ))}
      </div>

      {/* 더 보기 버튼 */}
      {MOCK_REMAINING_COUNT > 0 && (
        <div className={css({ display: 'flex', justifyContent: 'center' })}>
          <button
            type="button"
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1.5',
              h: '43px',
              px: '6',
              borderRadius: 'full',
              border: '1px solid',
              borderColor: 'border.emphasized',
              bg: 'transparent',
              color: 'fg.default',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              _hover: { bg: 'bg.surfaceRaised', borderColor: 'border.default' },
              transition:
                'background {durations.fast}, border-color {durations.fast}',
            })}
          >
            더 보기 · {MOCK_REMAINING_COUNT.toLocaleString()}개 남음
            <span>↓</span>
          </button>
        </div>
      )}
    </div>
  );
}
