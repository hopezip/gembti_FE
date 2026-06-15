import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GameDetail } from '@/features/game/api/gameDetail';
import { GameInfoTable } from './GameInfoTable';

// GameInfoTable은 detail: GameDetail 한 개를 받는 순수 표시 컴포넌트다.
// 핵심 검증: 플레이 모드 코드→라벨 매핑(SINGLE→싱글플레이 등)과 한글 지원 항목(자막/음성/UI) 렌더.
// dl/dt/dd 구조이므로 라벨(dt)을 기준으로 값(dd)을 좁혀 단언한다.
function makeDetail(overrides: Partial<GameDetail> = {}): GameDetail {
  return {
    gameId: 1,
    title: '테스트 게임',
    description: '',
    fullDescription: '',
    genres: ['액션', 'RPG'],
    categories: [],
    rating: 4.5,
    reviewCount: 100,
    priceInfo: { originalPrice: 30000, salePrice: null, discountRate: 0 },
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
    interfaceLanguages: ['영어'],
    playModes: ['SINGLE', 'CO_OP', 'MULTI'],
    koreanSub: true,
    ageRating: '15세 이용가',
    onSale: false,
    steamUrl: 'https://store.steampowered.com/app/1',
    developerGames: [],
    ...overrides,
  };
}

describe('GameInfoTable', () => {
  it('플레이 모드 코드를 한국어 라벨로 매핑해 표시한다(SINGLE→싱글플레이 등)', () => {
    render(
      <GameInfoTable
        detail={makeDetail({ playModes: ['SINGLE', 'CO_OP', 'MULTI'] })}
      />,
    );
    // dt '플레이 모드'의 짝 dd에 라벨이 ' · '로 join 되어 들어간다.
    expect(
      screen.getByText('싱글플레이 · 2인협동 · 온라인'),
    ).toBeInTheDocument();
  });

  it('미정의 플레이 모드 코드는 원문을 그대로 노출한다', () => {
    render(<GameInfoTable detail={makeDetail({ playModes: ['UNKNOWN'] })} />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('한글 지원 행에 자막/음성/UI 항목을 렌더한다', () => {
    render(<GameInfoTable detail={makeDetail()} />);
    // '한글 지원' dt → 같은 행(dd)에서 세 항목 라벨을 찾는다.
    const koreanLabel = screen.getByText('한글 지원');
    const row = koreanLabel.closest('div') as HTMLElement;
    const scope = within(row);
    expect(scope.getByText('자막')).toBeInTheDocument();
    expect(scope.getByText('음성')).toBeInTheDocument();
    expect(scope.getByText('UI')).toBeInTheDocument();
  });

  it('한글 지원 여부를 점의 aria-label(지원/미지원)로 노출한다', () => {
    // 자막 지원·음성 한국어 포함·UI 한국어 미포함 케이스.
    render(
      <GameInfoTable
        detail={makeDetail({
          koreanSub: true,
          audioLanguages: ['한국어', '영어'],
          interfaceLanguages: ['영어'],
        })}
      />,
    );
    const koreanLabel = screen.getByText('한글 지원');
    const row = koreanLabel.closest('div') as HTMLElement;
    const scope = within(row);
    // 자막·음성 지원(2개), UI 미지원(1개).
    expect(scope.getAllByLabelText('지원')).toHaveLength(2);
    expect(scope.getAllByLabelText('미지원')).toHaveLength(1);
  });

  it('장르·연령 등급 등 기본 항목을 표시한다', () => {
    render(
      <GameInfoTable
        detail={makeDetail({
          genres: ['액션', 'RPG'],
          ageRating: '15세 이용가',
        })}
      />,
    );
    expect(screen.getByText('액션 · RPG')).toBeInTheDocument();
    expect(screen.getByText('15세 이용가')).toBeInTheDocument();
  });
});
