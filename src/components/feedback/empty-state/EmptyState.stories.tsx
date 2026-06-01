import type { Meta, StoryObj } from '@storybook/react-vite';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    type: 'search',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['search', 'post', 'comment', 'review', 'party', 'notification'],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Search: Story = {
  args: {
    type: 'search',
    target: '발더스 게이트 3',
  },
};

export const Comment: Story = {
  args: {
    type: 'comment',
  },
};

export const Post: Story = {
  args: {
    type: 'post',
    action: <Button variant="primary">글쓰기</Button>,
  },
};

export const Review: Story = {
  args: {
    type: 'review',
    action: <Button variant="primary">리뷰 작성하기</Button>,
  },
};

export const Party: Story = {
  args: {
    type: 'party',
    action: <Button variant="primary">파티 만들기</Button>,
  },
};

export const Notification: Story = {
  args: {
    type: 'notification',
  },
};

export const MyPageActivity: Story = {
  render: () => (
    <section
      className={css({
        w: '100%',
        maxW: '1280px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '5',
      })}
    >
      <ActivityPanel title="내 리뷰">
        <EmptyState
          type="review"
          title="아직 작성한 리뷰가 없어요"
          description="플레이한 게임에 리뷰를 남기면 이곳에서 모아볼 수 있어요."
          action={<Button variant="primary">리뷰 작성하기</Button>}
          className={css({ minH: '220px', py: '8' })}
        />
      </ActivityPanel>

      <ActivityPanel title="내 파티">
        <EmptyState
          type="party"
          title="참여 중인 파티가 없어요"
          description="파티를 만들거나 모집 중인 파티에 참여해보세요."
          action={<Button variant="primary">파티 만들기</Button>}
          className={css({ minH: '220px', py: '8' })}
        />
      </ActivityPanel>

      <ActivityPanel title="알림">
        <EmptyState
          type="notification"
          title="아직 알림이 없어요"
          description="리뷰 댓글, 파티 신청, 동기화 소식이 이곳에 표시돼요."
          className={css({ minH: '220px', py: '8' })}
        />
      </ActivityPanel>
    </section>
  ),
};

function ActivityPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={css({
        overflow: 'hidden',
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'lg',
      })}
    >
      <header
        className={css({
          h: '44px',
          display: 'flex',
          alignItems: 'center',
          px: '4',
          borderBottom: '1px solid',
          borderColor: 'border.default',
        })}
      >
        <h3
          className={css({
            textStyle: 'body.sm',
            fontWeight: 'bold',
            color: 'fg.default',
          })}
        >
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}
