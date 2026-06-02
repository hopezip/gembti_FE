import type { Meta, StoryObj } from '@storybook/react-vite';
import { Wrap } from 'styled-system/jsx';
import { Button } from './Button';
import { toaster, Toaster } from './Toast';

const meta = {
  title: 'UI/Toast',
  component: Toaster,
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Types: Story = {
  render: () => (
    <>
      <Wrap gap="4">
        <Button
          onClick={() =>
            toaster.success({
              closable: true,
              title: '성공',
              description: '정상적으로 처리되었습니다.',
            })
          }
          type="button"
          variant="primary"
        >
          success
        </Button>
        <Button
          onClick={() =>
            toaster.error({
              closable: true,
              title: '오류',
              description: '요청 내용을 확인해주세요.',
            })
          }
          type="button"
          variant="danger"
        >
          error
        </Button>
        <Button
          onClick={() =>
            toaster.warning({
              closable: true,
              title: '주의',
              description: '잠시 후 다시 시도해주세요.',
            })
          }
          type="button"
          variant="secondary"
        >
          warning
        </Button>
        <Button
          onClick={() =>
            toaster.info({
              closable: true,
              title: '안내',
              description: '처리 상태를 확인해주세요.',
            })
          }
          type="button"
          variant="secondary"
        >
          info
        </Button>
      </Wrap>
      <Toaster />
    </>
  ),
};
