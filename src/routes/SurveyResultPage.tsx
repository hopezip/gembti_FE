import { css } from 'styled-system/css';
import { EmptyState } from '@/components/feedback/empty-state/EmptyState';
import { PageContainer } from '@/components/layout/PageContainer';
import { Spinner } from '@/components/ui/Spinner';
import {
  useSurveyRecommendations,
  useSurveyResult,
} from '@/features/survey/api/surveyResult';
import type { SurveyStats, SurveyTraitKey } from '@/features/survey/api/types';
import { GameRecommendations } from '@/features/survey/components/GameRecommendations';
import { ResultSummary } from '@/features/survey/components/ResultSummary';
import type { TraitScore } from '@/features/survey/components/TraitRadarChart';

function mapSurveyScores(stats: SurveyStats): TraitScore[] {
  return [
    { label: '탐험', score: stats.exploration },
    { label: '액션', score: stats.combat },
    { label: '성장', score: stats.growth },
    { label: '힐링', score: stats.healing },
    { label: '협동', score: stats.cooperation },
    { label: '전략', score: stats.strategy },
  ];
}

const traitPresentation: Record<
  SurveyTraitKey,
  { description: string; tags: string[] }
> = {
  exploration: {
    description:
      '넓은 세계를 돌아다니며 새로운 장소와 숨겨진 이야기를 발견하는 과정에 몰입하는 탐험가입니다.',
    tags: ['오픈월드', '탐험'],
  },
  combat: {
    description:
      '빠른 판단과 짜릿한 손맛을 즐기며, 직접 부딪쳐 승부를 결정하는 순간에 몰입하는 액션가입니다.',
    tags: ['액션', '실시간 전투'],
  },
  growth: {
    description:
      '캐릭터와 장비가 강해지는 과정을 즐기며, 꾸준히 목표를 완성해 나가는 성장가입니다.',
    tags: ['성장', '육성'],
  },
  healing: {
    description:
      '경쟁의 긴장감보다 편안한 흐름과 이야기에 집중하며, 오래 머물 수 있는 경험을 선호하는 힐링가입니다.',
    tags: ['힐링', '내러티브'],
  },
  cooperation: {
    description:
      '혼자보다 함께할 때 생기는 변수와 재미를 즐기며, 팀 안에서 호흡을 맞추는 협동가입니다.',
    tags: ['협동', '멀티 플레이'],
  },
  strategy: {
    description:
      '게임의 규칙을 파악하고 최적의 선택을 설계하며, 계획이 결과로 이어지는 순간을 즐기는 전략가입니다.',
    tags: ['전략', '빌드 설계'],
  },
};

function getSurveyPresentation(stats: SurveyStats) {
  const activeTraits = (Object.keys(stats) as SurveyTraitKey[])
    .filter((trait) => stats[trait] > 0)
    .sort((left, right) => stats[right] - stats[left]);
  const primaryTrait = activeTraits[0] ?? 'exploration';

  return {
    description: traitPresentation[primaryTrait].description,
    tags: activeTraits
      .slice(0, 2)
      .flatMap((trait) => traitPresentation[trait].tags),
  };
}

export function SurveyResultPage() {
  const { data, isError, isLoading } = useSurveyResult();
  const recommendations = useSurveyRecommendations(Boolean(data));

  if (isLoading) {
    return (
      <main
        className={css({
          bg: 'bg.canvas',
          minH: '100%',
          display: 'grid',
          placeItems: 'center',
        })}
      >
        <Spinner aria-label="설문 결과 불러오는 중" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className={css({ bg: 'bg.canvas', minH: '100%' })}>
        <EmptyState
          description="잠시 후 다시 결과를 확인해 주세요."
          title="설문 결과를 불러오지 못했어요"
          type="notification"
        />
      </main>
    );
  }

  const presentation = getSurveyPresentation(data.stats);

  return (
    <main className={css({ bg: 'bg.canvas', minH: '100%' })}>
      <PageContainer className={css({ py: { base: '10', md: '16' } })}>
        {/* 설문 분석 결과 상단: 레이더 + 대표 유형 설명. */}
        <ResultSummary
          archetype={data.type}
          description={presentation.description}
          scores={mapSurveyScores(data.stats)}
          tags={presentation.tags}
        />
        {recommendations.isLoading && (
          <div
            className={css({ display: 'grid', placeItems: 'center', py: '16' })}
          >
            <Spinner aria-label="맞춤 게임 추천 불러오는 중" />
          </div>
        )}
        {recommendations.isError && (
          <EmptyState
            description="성향 분석 결과는 저장되었어요. 추천은 잠시 후 다시 확인해 주세요."
            title="맞춤 게임 추천을 불러오지 못했어요"
            type="notification"
          />
        )}
        {recommendations.data && (
          <GameRecommendations
            games={recommendations.data.games.map((game) => ({
              id: game.game_id,
              title: game.name,
              genres: game.genres,
              thumbnailUrl: game.image_url,
              reason: game.reason,
            }))}
          />
        )}
      </PageContainer>
    </main>
  );
}
