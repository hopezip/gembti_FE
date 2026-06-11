import type { components } from '@/types/api';

// 검색 필터 옵션 (SEARCH-FE-005 실서버 연결).
// 실서버에는 filter-options 엔드포인트가 없다 — 장르·카테고리는 OpenAPI 고정 enum이다.
// 따라서 별도 fetch 없이 생성 타입(api.ts)의 enum 값을 정적 상수로 노출한다.
// 값이 바뀌면 /api-sync로 api.ts 재생성 후 이 목록만 동기화하면 된다.

type GenreOption = components['schemas']['GenreOption'];
type CategoryOption = components['schemas']['CategoryOption'];

// 장르 — GenreOption enum (검색 genre[] 필터 값과 동일).
export const GENRE_OPTIONS: GenreOption[] = [
  '액션',
  '어드벤처',
  '롤플레잉',
  '전략',
  '시뮬레이션',
  '캐주얼',
  '대규모 멀티플레이어',
  '스포츠',
  '레이싱',
  '인디',
];

// 카테고리(플레이 방식) — CategoryOption enum (검색 category[] 필터 값과 동일).
export const CATEGORY_OPTIONS: CategoryOption[] = [
  '싱글플레이어',
  '협동',
  '온라인 협동',
  '멀티플레이어',
  '플레이어 대전',
  '온라인 플레이어 대전',
];
