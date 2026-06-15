import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/ky';

// 게임 상세 데이터 계층 (REC-DET-FE-001 / REC-DET-FE-002 실 백엔드 정합).
// 백엔드 계약: GET /api/v1/games/{game_id} (인증 불필요) — status/data 래핑 + snake_case + price_info.
// 응답은 snake_case로 오므로, 이 파일의 매핑 함수가 camelCase 도메인 타입으로 변환한다.
// 컴포넌트는 camelCase 도메인 타입만 사용한다(백엔드 연결 시 매핑 계층만 유지하면 됨).
// fetch/ky 직접 호출 금지 — 컴포넌트는 useGameDetail 훅만 사용한다.

// play_modes 코드(value) → 한국어 라벨 매핑. mock/백엔드는 코드(SINGLE/CO_OP/MULTI)를 내려주고
// 화면 표기는 이 헬퍼로 변환한다. 미정의 코드는 코드 원문을 그대로 노출한다(누락 방지).
export const PLAY_MODE_LABELS: Record<string, string> = {
  SINGLE: '싱글플레이',
  CO_OP: '2인협동',
  MULTI: '온라인',
};

// play_modes 코드 배열을 라벨 배열로 변환한다. 미정의 코드는 원문 유지.
export function mapPlayModeLabels(codes: string[]): string[] {
  return codes.map((code) => PLAY_MODE_LABELS[code] ?? code);
}

// --- raw(snake_case) — 백엔드 응답 형태 그대로 ---
interface PriceInfoRaw {
  original_price: number;
  sale_price: number | null;
  discount_rate: number;
}

// 사양(최소/권장) 객체 — 권장 사양은 항목별로 분해되어 온다.
interface SystemSpecRaw {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

interface SystemRequirementsRaw {
  minimum: SystemSpecRaw;
  recommended: SystemSpecRaw;
}

// 카드 섹션(개발사의 다른 게임) 항목 — GameSummaryCard가 받는 최소 형태.
interface GameSummaryRaw {
  game_id: number;
  title: string;
  // swagger상 GameSummaryResponse.thumbnail_url은 nullable(string|null). 매핑에서 falsy fallback.
  thumbnail_url: string | null;
  genres: string[];
  rating: number | null;
}

interface GameDetailRaw {
  game_id: number;
  title: string;
  description: string;
  full_description: string;
  genres: string[];
  // 계약상 categories는 required non-null이나, mock/매핑 안전을 위해 옵셔널+nullable로 두고 매핑에서 빈 배열로 정규화한다.
  categories?: string[] | null;
  rating: number | null;
  review_count: number;
  price_info: PriceInfoRaw;
  developer: string;
  publisher: string;
  // 실 스키마상 nullable(string|null). 소비처에서 falsy fallback(`-`).
  release_date: string | null;
  thumbnail_url: string | null;
  theme_image_url: string;
  banner_url: string;
  screenshot_urls: string[];
  trailer_url: string | null;
  system_requirements: SystemRequirementsRaw;
  audio_languages: string[];
  interface_languages: string[];
  // 플레이 모드는 코드(value) 배열로 온다(SINGLE/CO_OP/MULTI). 라벨 변환은 화면단에서.
  play_modes: string[];
  korean_sub: boolean;
  age_rating: string;
  on_sale: boolean;
  developer_games: GameSummaryRaw[];
}

interface GameDetailResponseRaw {
  status: string;
  data: GameDetailRaw;
}

// --- 도메인(camelCase) — 컴포넌트가 보는 형태 ---
export interface GamePriceInfo {
  originalPrice: number;
  salePrice: number | null;
  discountRate: number;
}

// 사양(최소/권장) 도메인 타입.
export interface SystemSpec {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

export interface SystemRequirements {
  minimum: SystemSpec;
  recommended: SystemSpec;
}

// 카드 섹션 항목 도메인 타입 — GameSummaryCard가 받는 최소 형태에 맞춤.
// 개발사의 다른 게임이 사용한다.
export interface GameSummaryItem {
  gameId: number;
  title: string;
  thumbnailUrl: string;
  genres: string[];
  rating: number | null;
}

export interface GameDetail {
  gameId: number;
  title: string;
  description: string;
  fullDescription: string;
  genres: string[];
  categories: string[];
  rating: number | null;
  reviewCount: number;
  priceInfo: GamePriceInfo;
  developer: string;
  publisher: string;
  releaseDate: string | null;
  thumbnailUrl: string | null;
  themeImageUrl: string;
  bannerUrl: string;
  screenshotUrls: string[];
  trailerUrl: string | null;
  systemRequirements: SystemRequirements;
  audioLanguages: string[];
  interfaceLanguages: string[];
  // 플레이 모드 코드(value) 배열(SINGLE/CO_OP/MULTI). 라벨은 PLAY_MODE_LABELS로 변환한다.
  playModes: string[];
  koreanSub: boolean;
  ageRating: string;
  onSale: boolean;
  developerGames: GameSummaryItem[];
}

function mapSystemSpec(raw: SystemSpecRaw): SystemSpec {
  return {
    os: raw.os,
    processor: raw.processor,
    memory: raw.memory,
    graphics: raw.graphics,
    storage: raw.storage,
  };
}

function mapGameSummaryItem(raw: GameSummaryRaw): GameSummaryItem {
  return {
    gameId: raw.game_id,
    title: raw.title,
    // thumbnail_url nullable → searchGames 패턴대로 빈 문자열로 정규화(소비처 falsy 처리).
    thumbnailUrl: raw.thumbnail_url ?? '',
    genres: raw.genres,
    rating: raw.rating,
  };
}

// 매핑 단위 테스트(gameDetail.test.ts)에서 직접 호출하기 위해 export 한다.
export function mapGameDetail(raw: GameDetailRaw): GameDetail {
  return {
    gameId: raw.game_id,
    title: raw.title,
    description: raw.description,
    fullDescription: raw.full_description,
    genres: raw.genres,
    categories: raw.categories ?? [],
    rating: raw.rating,
    reviewCount: raw.review_count,
    priceInfo: {
      originalPrice: raw.price_info.original_price,
      salePrice: raw.price_info.sale_price,
      discountRate: raw.price_info.discount_rate,
    },
    developer: raw.developer,
    publisher: raw.publisher,
    releaseDate: raw.release_date,
    thumbnailUrl: raw.thumbnail_url,
    themeImageUrl: raw.theme_image_url,
    bannerUrl: raw.banner_url,
    screenshotUrls: raw.screenshot_urls,
    trailerUrl: raw.trailer_url,
    systemRequirements: {
      minimum: mapSystemSpec(raw.system_requirements.minimum),
      recommended: mapSystemSpec(raw.system_requirements.recommended),
    },
    audioLanguages: raw.audio_languages,
    interfaceLanguages: raw.interface_languages,
    playModes: raw.play_modes,
    koreanSub: raw.korean_sub,
    ageRating: raw.age_rating,
    onSale: raw.on_sale,
    developerGames: raw.developer_games.map(mapGameSummaryItem),
  };
}

// 게임 상세 1건 = 1쿼리. gameId를 키에 포함해 게임별로 캐시한다.
// 유효하지 않은 id(NaN·0·음수)에서는 요청하지 않는다(enabled 가드).
export function useGameDetail(gameId: number) {
  return useQuery({
    queryKey: ['games', 'detail', gameId],
    // TanStack Query가 주는 signal을 ky에 연결 — 언마운트/리페치 시 진행 중 요청 취소.
    queryFn: ({ signal }) =>
      api
        .get(`api/v1/games/${gameId}`, { signal })
        .json<GameDetailResponseRaw>()
        .then((r) => mapGameDetail(r.data)),
    enabled: Number.isFinite(gameId) && gameId > 0,
  });
}
