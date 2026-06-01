import {
  FileText,
  Gamepad2,
  Megaphone,
  MessageCircle,
  Search,
  Star,
  type LucideIcon,
} from 'lucide-react';

export type EmptyStateType =
  | 'search'
  | 'post'
  | 'comment'
  | 'review'
  | 'party'
  | 'notification';

interface EmptyStateMessage {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export const EMPTY_STATE_MESSAGES = {
  search: {
    icon: Search,
    title: '검색 결과가 없어요',
    description: '검색어를 다시 입력하거나 필터를 조정해보세요.',
  },
  post: {
    icon: FileText,
    title: '아직 게시글이 없어요',
    description: '첫 게시글을 작성해 커뮤니티를 채워보세요.',
  },
  comment: {
    icon: MessageCircle,
    title: '아직 댓글이 없어요',
    description: '첫 댓글을 남겨 대화를 시작해보세요.',
  },
  review: {
    icon: Star,
    title: '아직 리뷰가 없어요',
    description: '플레이해보신 게임이라면 첫 번째 리뷰의 주인공이 되어보세요!',
  },
  party: {
    icon: Gamepad2,
    title: '모집 중인 파티가 없어요',
    description: '새 파티를 만들고 같이 플레이할 유저를 찾아보세요.',
  },
  notification: {
    icon: Megaphone,
    title: '아직 알림이 없어요',
    description: '게시글이나 리뷰에 새로운 댓글이 달리면 이곳에 표시돼요',
  },
} as const satisfies Record<EmptyStateType, EmptyStateMessage>;
