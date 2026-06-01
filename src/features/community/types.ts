export type PostType = 'free' | 'review' | 'party' | 'guide' | 'notice';

export interface PostAuthor {
  initial: string;
  nickname: string;
  personalityTag: string;
  isAdmin?: boolean;
}

interface BasePost {
  id: number;
  author: PostAuthor;
  timeAgo: string;
  title: string;
  voteCount: number;
  isVoted: boolean;
  commentCount: number;
  pinned?: boolean;
}

export interface FreePost extends BasePost {
  type: 'free' | 'guide' | 'notice';
  bodyPreview: string;
  gameName?: string;
}

export interface ReviewPost extends BasePost {
  type: 'review';
  bodyPreview: string;
  gameName: string;
  starRating: string;
  genre: string;
  playHours: string;
  clearStatus: string;
}

export interface PartyPost extends BasePost {
  type: 'party';
  gameName: string;
  timeSlot: string;
  mode: string;
  currentMembers: number;
  maxMembers: number;
}

export type CommunityPost = FreePost | ReviewPost | PartyPost;
