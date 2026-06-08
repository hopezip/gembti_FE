import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GameDetail } from '@/features/game/api/gameDetail';
import { GameDetailHero } from './GameDetailHero';

// GameDetailHero는 detail: GameDetail 한 개를 받는다(외부 컨텍스트/쿼리 불필요).
// 스타일은 Panda 정적 클래스라 단언하지 않고, 조건부 렌더(별점·할인배지)와 핵심 텍스트만 검증한다.
// 각 케이스가 필요한 필드만 override하도록 기본 fixture 팩토리를 둔다.
function makeDetail(overrides: Partial<GameDetail> = {}): GameDetail {
  return {
    gameId: 1,
    title: '테스트 게임',
    description: '',
    fullDescription: '',
    genres: ['액션'],
    tags: ['싱글플레이', 'RPG'],
    rating: 4.5,
    reviewCount: 100,
    priceInfo: {
      originalPrice: 30000,
      salePrice: 21000,
      discountRate: 30,
    },
    developer: '개발사',
    publisher: '퍼블리셔',
    releaseDate: '2024-03-15',
    thumbnailUrl: '',
    themeImageUrl: '',
    bannerUrl: '',
    screenshotUrls: [],
    trailerUrl: null,
    systemRequirements: {
      minimum: {
        os: 'Windows 10',
        processor: 'i5',
        memory: '8GB',
        graphics: 'GTX 1060',
        storage: '50GB',
      },
      recommended: {
        os: 'Windows 11',
        processor: 'i7',
        memory: '16GB',
        graphics: 'RTX 3060',
        storage: '50GB',
      },
    },
    audioLanguages: ['한국어'],
    interfaceLanguages: ['한국어'],
    playModes: ['SINGLE'],
    koreanSub: true,
    ageRating: '15세 이용가',
    onSale: true,
    similarGames: [],
    developerGames: [],
    aiMatch: null,
    reviewStats: null,
    ...overrides,
  };
}

describe('GameDetailHero', () => {
  it('rating이 null이면 별점(★)을 표시하지 않는다', () => {
    render(<GameDetailHero detail={makeDetail({ rating: null })} />);
    // 별점 문자(★)가 DOM에 없어야 한다.
    expect(screen.queryByText('★')).not.toBeInTheDocument();
  });

  it('rating이 있으면 ★와 소수점 1자리 점수를 표시한다', () => {
    render(<GameDetailHero detail={makeDetail({ rating: 4.5 })} />);
    expect(screen.getByText('★')).toBeInTheDocument();
    // toFixed(1)로 포맷된다.
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('salePrice가 null이면 할인 배지를 표시하지 않는다', () => {
    render(
      <GameDetailHero
        detail={makeDetail({
          priceInfo: { originalPrice: 30000, salePrice: null, discountRate: 0 },
        })}
      />,
    );
    // 할인 배지 텍스트(-NN%)가 없어야 한다.
    expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument();
    // 정가 취소선도 노출되지 않으므로 가격은 정가만 1회 노출.
    expect(screen.getByText('30,000원')).toBeInTheDocument();
  });

  it('salePrice가 있고 onSale·할인율>0이면 할인 배지를 표시한다', () => {
    render(
      <GameDetailHero
        detail={makeDetail({
          onSale: true,
          priceInfo: {
            originalPrice: 30000,
            salePrice: 21000,
            discountRate: 30,
          },
        })}
      />,
    );
    expect(screen.getByText('-30%')).toBeInTheDocument();
    // 세일가 + 정가 취소선이 함께 노출된다.
    expect(screen.getByText('21,000원')).toBeInTheDocument();
    expect(screen.getByText('30,000원')).toBeInTheDocument();
  });

  it('구매 버튼을 렌더한다', () => {
    render(<GameDetailHero detail={makeDetail()} />);
    expect(
      screen.getByRole('button', { name: /구매하러 가기/ }),
    ).toBeInTheDocument();
  });
});
