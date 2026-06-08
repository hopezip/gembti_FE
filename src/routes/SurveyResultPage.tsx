import { css } from 'styled-system/css';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  GameRecommendations,
  type RecommendedGame,
} from '@/features/survey/components/GameRecommendations';
import { ResultSummary } from '@/features/survey/components/ResultSummary';
import type { TraitScore } from '@/features/survey/components/TraitRadarChart';

// MSW/API 연결 전 레이아웃 검증용 임시 점수 데이터.
const surveyScores: TraitScore[] = [
  { label: '탐험', score: 92 },
  { label: '액션', score: 40 },
  { label: '도전', score: 70 },
  { label: '서사', score: 80 },
  { label: '협동', score: 5 },
  { label: '전략', score: 30 },
];

// 대표 성향 태그. 추후 설문 결과 API의 archetype/tag 필드로 교체한다.
const surveyTags = ['오픈월드', '안온한 서사', '내러티브', '싱글 플레이'];

// 설문 결과 기반 추천 mock. API 연결 전까지 공통 게임 카드 레이아웃 확인에 사용한다.
const recommendedGames: RecommendedGame[] = [
  {
    id: 301,
    title: 'SHADOWS DIE TWICE',
    genres: ['RPG', '오픈월드'],
    thumbnailUrl: 'https://picsum.photos/seed/tendency-result-1/640/400',
    reason: '탐험 92 일치 · 메인 스토리 사이드',
  },
  {
    id: 302,
    title: 'SHADOWS DIE TWICE',
    genres: ['RPG', '오픈월드'],
    thumbnailUrl: 'https://picsum.photos/seed/tendency-result-2/640/400',
    reason: '탐험 92 일치 · 메인 스토리 사이드',
  },
  {
    id: 303,
    title: 'SHADOWS DIE TWICE',
    genres: ['RPG', '오픈월드'],
    thumbnailUrl: 'https://picsum.photos/seed/tendency-result-3/640/400',
    reason: '탐험 92 일치 · 메인 스토리 사이드',
  },
  {
    id: 304,
    title: 'SHADOWS DIE TWICE',
    genres: ['RPG', '오픈월드'],
    thumbnailUrl: 'https://picsum.photos/seed/tendency-result-4/640/400',
    reason: '탐험 92 일치 · 메인 스토리 사이드',
  },
];

export function SurveyResultPage() {
  return (
    <main className={css({ bg: 'bg.canvas', minH: '100%' })}>
      <PageContainer className={css({ py: { base: '10', md: '16' } })}>
        {/* 설문 분석 결과 상단: 레이더 + 대표 유형 설명. */}
        <ResultSummary scores={surveyScores} tags={surveyTags} />
        {/* 설문 분석 결과 하단: 결과 기반 게임 추천 4개. */}
        <GameRecommendations games={recommendedGames} />
      </PageContainer>
    </main>
  );
}
