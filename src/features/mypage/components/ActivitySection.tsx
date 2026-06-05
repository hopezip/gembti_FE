import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import type {
  MockReviewItem,
  MockChatItem,
  MockNotification,
} from '@/mocks/handlers/mypage';

interface ActivityResponse {
  reviews: MockReviewItem[];
  chats: MockChatItem[];
  notifications: MockNotification[];
}

function ActivityCard({
  title,
  count,
  children,
  linkLabel,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  linkLabel?: string;
}) {
  return (
    <div
      className={css({
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'xl',
        p: '4',
        flex: 1,
        minW: 0,
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '3',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'baseline',
            gap: '1.5',
          })}
        >
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'fg.default',
            })}
          >
            {title}
          </span>
          {count !== undefined && (
            <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
              {count}
            </span>
          )}
        </div>
        {linkLabel && (
          <button
            type="button"
            className={css({
              fontSize: 'xs',
              color: 'accent.fg',
              bg: 'transparent',
              border: 'none',
              cursor: 'pointer',
            })}
          >
            {linkLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ReviewList({ reviews }: { reviews: MockReviewItem[] }) {
  return (
    <div
      className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}
    >
      {reviews.map((r) => (
        <div
          key={r.id}
          className={css({
            pb: '2',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            _last: { borderBottom: 'none', pb: 0 },
          })}
        >
          <p
            className={css({
              fontSize: 'xs',
              color: 'fg.muted',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              mb: '0.5',
            })}
          >
            {r.content}
          </p>
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            })}
          >
            <div className={css({ display: 'flex', gap: '2' })}>
              <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                게임 평점 ★ {r.rating.toFixed(1)}
              </span>
              <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                좋아요 {r.likeCount}
              </span>
            </div>
            <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
              {r.createdAt}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatList({ chats }: { chats: MockChatItem[] }) {
  return (
    <div
      className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}
    >
      {chats.map((c) => (
        <div
          key={c.id}
          className={css({
            pb: '2',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            _last: { borderBottom: 'none', pb: 0 },
          })}
        >
          <p
            className={css({
              fontSize: 'xs',
              color: 'fg.muted',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              mb: '0.5',
            })}
          >
            {c.preview}
          </p>
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
            })}
          >
            <div className={css({ display: 'flex', gap: '2' })}>
              <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                참가자 {c.participants}명
              </span>
              <span
                className={css({
                  fontSize: 'xs',
                  color: c.isActive ? 'accent.fg' : 'fg.subtle',
                  bg: c.isActive ? 'accent.soft' : 'bg.surfaceRaised',
                  px: '1',
                  borderRadius: 'sm',
                })}
              >
                {c.isActive ? '진행중' : '마감'}
              </span>
            </div>
            <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
              {c.updatedAt}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationList({
  notifications,
}: {
  notifications: MockNotification[];
}) {
  return (
    <div
      className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}
    >
      {notifications.map((n) => (
        <div
          key={n.id}
          className={css({
            display: 'flex',
            alignItems: 'flex-start',
            gap: '2',
            pb: '2',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            _last: { borderBottom: 'none', pb: 0 },
          })}
        >
          {!n.isRead && (
            <div
              className={css({
                w: '1.5',
                h: '1.5',
                borderRadius: 'full',
                bg: 'accent.default',
                mt: '1.5',
                flexShrink: 0,
              })}
            />
          )}
          <div className={css({ flex: 1, minW: 0 })}>
            <p
              className={css({
                fontSize: 'xs',
                color: n.isRead ? 'fg.subtle' : 'fg.muted',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                mb: '0.5',
              })}
            >
              {n.message}
            </p>
            <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
              {n.createdAt}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivitySection() {
  const { data, isLoading } = useQuery({
    queryKey: ['mypage', 'activity'],
    queryFn: () => ky.get('/api/mypage/activity').json<ActivityResponse>(),
  });

  if (isLoading) {
    return (
      <section>
        <h2
          className={css({
            fontSize: 'lg',
            fontWeight: 'bold',
            color: 'fg.default',
            mb: '4',
          })}
        >
          활동
        </h2>
        <div className={css({ display: 'flex', gap: '4' })}>
          {(['reviews', 'chats', 'notifications'] as const).map((key) => (
            <div
              key={key}
              className={css({
                flex: 1,
                h: '40',
                bg: 'bg.surfaceRaised',
                borderRadius: 'xl',
              })}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2
        className={css({
          fontSize: 'lg',
          fontWeight: 'bold',
          color: 'fg.default',
          mb: '4',
        })}
      >
        활동
      </h2>
      <div className={css({ display: 'flex', gap: '4' })}>
        <ActivityCard
          title="내 리뷰"
          count={data?.reviews.length}
          linkLabel="전체 보기"
        >
          {data?.reviews.length ? (
            <ReviewList reviews={data.reviews} />
          ) : (
            <EmptyState type="review" />
          )}
        </ActivityCard>

        <ActivityCard
          title="내 채팅"
          count={data?.chats.length}
          linkLabel="전체 보기"
        >
          {data?.chats.length ? (
            <ChatList chats={data.chats} />
          ) : (
            <EmptyState type="party" />
          )}
        </ActivityCard>

        <ActivityCard
          title="알림"
          count={data?.notifications.filter((n) => !n.isRead).length}
          linkLabel="전체 보기"
        >
          {data?.notifications.length ? (
            <NotificationList notifications={data.notifications} />
          ) : (
            <EmptyState type="notification" />
          )}
        </ActivityCard>
      </div>
    </section>
  );
}
