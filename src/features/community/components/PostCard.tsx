import { css } from 'styled-system/css';
import type { CommunityPost, PartyPost, ReviewPost } from '../types';
import { AuthorMeta } from './AuthorMeta';
import { GameTag } from './GameTag';
import { PostTypeTag } from './PostTypeTag';
import { VoteButton } from './VoteButton';

interface PostCardProps {
  post: CommunityPost;
  isFirst?: boolean;
  isLast?: boolean;
}

// 게임 커버 placeholder — 리뷰 포스트의 80×106px 썸네일
function GameCoverThumb() {
  return (
    <div
      className={css({
        w: '80px',
        h: '106px',
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'border.default',
        bg: 'bg.subtle',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      })}
    >
      <span
        className={css({
          fontFamily: 'mono',
          fontSize: '9.5px',
          color: 'fg.subtle',
          textAlign: 'center',
        })}
      >
        게임
        <br />
        커버
      </span>
    </div>
  );
}

// review-meta 3개 pill (장르/플레이타임/클리어여부)
function ReviewMetaPills({ post }: { post: ReviewPost }) {
  const pills = [post.genre, post.playHours, post.clearStatus];
  return (
    <div className={css({ display: 'flex', gap: '1.5', flexWrap: 'wrap' })}>
      {pills.map((label) => (
        <span
          key={label}
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            h: '19px',
            px: '1.5',
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'border.emphasized',
            fontFamily: 'mono',
            fontSize: '11.5px',
            color: 'fg.muted',
            whiteSpace: 'nowrap',
            lineHeight: '1',
          })}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

// party-info 4열 박스
function PartyInfoBox({ post }: { post: PartyPost }) {
  const isFull = post.currentMembers >= post.maxMembers;
  const items = [
    { label: '게임', value: post.gameName, isCount: false },
    { label: '시간대', value: post.timeSlot, isCount: false },
    { label: '모드', value: post.mode, isCount: false },
    { label: '인원', value: '', isCount: true },
  ];

  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        bg: 'bg.subtle',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'md',
        px: '3',
        py: '2.5',
      })}
    >
      {items.map(({ label, value, isCount }) => (
        <div
          key={label}
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '1',
          })}
        >
          <span
            className={css({
              fontFamily: 'mono',
              fontSize: '9.5px',
              color: 'fg.subtle',
              letterSpacing: '0.5px',
              lineHeight: '1.2',
            })}
          >
            {label}
          </span>
          {isCount ? (
            <span
              className={css({
                fontFamily: 'mono',
                fontWeight: 'bold',
                fontSize: '12.5px',
                color: isFull ? 'fg.subtle' : 'success.fg',
                lineHeight: '1.2',
                whiteSpace: 'nowrap',
              })}
            >
              {post.currentMembers}/{post.maxMembers}명{' '}
              <span className={css({ fontWeight: 'medium' })}>
                {isFull ? '마감' : '모집 중'}
              </span>
            </span>
          ) : (
            <span
              className={css({
                fontFamily: 'sans',
                fontWeight: 'medium',
                fontSize: '12.5px',
                color: 'fg.default',
                lineHeight: '1.2',
              })}
            >
              {value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// party CTA: 참여신청 or 마감 + 댓글 수
function PartyCta({ post }: { post: PartyPost }) {
  const isFull = post.currentMembers >= post.maxMembers;
  return (
    <div className={css({ display: 'flex', gap: '1.5' })}>
      <button
        type="button"
        disabled={isFull}
        className={css({
          h: '35px',
          px: '3',
          borderRadius: 'md',
          border: '1px solid',
          borderColor: isFull ? 'border.emphasized' : 'accent.default',
          bg: isFull ? 'rgba(255,255,255,0.04)' : 'accent.default',
          color: 'fg.default',
          fontSize: '12.5px',
          cursor: isFull ? 'not-allowed' : 'pointer',
          opacity: isFull ? 0.5 : 1,
          whiteSpace: 'nowrap',
          transition: 'opacity {durations.fast}',
        })}
      >
        {isFull ? '마감' : '참여 신청 →'}
      </button>
      <button
        type="button"
        className={css({
          h: '35px',
          px: '3',
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'border.emphasized',
          bg: 'rgba(255,255,255,0.04)',
          color: 'fg.default',
          fontSize: '12.5px',
          cursor: 'pointer',
          fontFamily: 'mono',
          whiteSpace: 'nowrap',
          _hover: { bg: 'bg.surfaceRaised' },
        })}
      >
        💬 {post.commentCount}
      </button>
    </div>
  );
}

// bottom-meta: GameTag + 댓글 수 + 고정 표시
function BottomMeta({
  gameName,
  commentCount,
  pinned,
}: {
  gameName?: string;
  commentCount: number;
  pinned?: boolean;
}) {
  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '3',
        h: '15px',
      })}
    >
      {gameName && <GameTag gameName={gameName} />}
      <span
        className={css({
          fontFamily: 'mono',
          fontSize: '11.5px',
          color: 'fg.subtle',
          whiteSpace: 'nowrap',
        })}
      >
        💬 {commentCount}
      </span>
      {pinned && (
        <span
          className={css({
            fontFamily: 'mono',
            fontSize: '11.5px',
            color: 'fg.subtle',
            whiteSpace: 'nowrap',
          })}
        >
          📌 고정됨
        </span>
      )}
    </div>
  );
}

// 게시글 카드 — 자유/공략/공지(free-style), 리뷰, 파티 모집 레이아웃 분기
export function PostCard({
  post,
  isFirst = false,
  isLast = false,
}: PostCardProps) {
  return (
    <article
      className={css({
        display: 'flex',
        alignItems: 'flex-start',
        gap: '3.5',
        px: '4',
        pt: '3.5',
        pb: '3.5',
        bg: 'bg.surface',
        borderLeft: '1px solid',
        borderRight: '1px solid',
        borderColor: 'border.default',
        borderTop: isFirst ? '1px solid' : '1px solid',
        borderTopColor: 'border.default',
        borderBottom: isLast ? '1px solid' : 'none',
        borderBottomColor: 'border.default',
        borderTopLeftRadius: isFirst ? 'lg' : '0',
        borderTopRightRadius: isFirst ? 'lg' : '0',
        borderBottomLeftRadius: isLast ? 'lg' : '0',
        borderBottomRightRadius: isLast ? 'lg' : '0',
      })}
    >
      <VoteButton count={post.voteCount} voted={post.isVoted} />

      {post.type === 'review' && <GameCoverThumb />}

      {/* 콘텐츠 영역 */}
      <div
        className={css({
          flex: 1,
          minW: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5',
        })}
      >
        {/* top-meta: 타입태그 + 작성자 */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            minW: 0,
          })}
        >
          <PostTypeTag type={post.type} />
          <AuthorMeta author={post.author} timeAgo={post.timeAgo} />
        </div>

        {/* 제목 */}
        <p
          className={css({
            fontSize: '15px',
            color: 'fg.default',
            lineHeight: '1.4',
            letterSpacing: '-0.1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          {post.title}
        </p>

        {/* 리뷰 전용: 별점 + meta pills */}
        {post.type === 'review' && (
          <>
            <p
              className={css({
                fontFamily: 'mono',
                fontSize: '14px',
                color: 'accent.fg',
                letterSpacing: '1.5px',
                lineHeight: '1.2',
              })}
            >
              {post.starRating}
            </p>
            <ReviewMetaPills post={post} />
          </>
        )}

        {/* 본문 미리보기 (자유/공략/공지/리뷰) */}
        {post.type !== 'party' && (
          <p
            className={css({
              fontSize: '12.5px',
              color: 'fg.muted',
              lineHeight: '1.5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            })}
          >
            {post.bodyPreview}
          </p>
        )}

        {/* 파티 모집 전용: info 박스 + CTA */}
        {post.type === 'party' && (
          <>
            <PartyInfoBox post={post} />
            <PartyCta post={post} />
          </>
        )}

        {/* bottom-meta (파티 제외: CTA에 댓글 수 포함) */}
        {post.type !== 'party' && (
          <BottomMeta
            gameName={post.gameName}
            commentCount={post.commentCount}
            pinned={post.pinned}
          />
        )}
      </div>
    </article>
  );
}
