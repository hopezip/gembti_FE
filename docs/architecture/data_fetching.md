# data_fetching.md — 데이터 패칭 (TanStack Query)

## 핵심 규칙 (인라인 룰 추출용)

- 서버 상태는 TanStack Query로만 관리 (Zustand 등 클라이언트 상태와 분리)
- queryKey는 도메인 + 파라미터 구조: `['games', { filter }]`, `['tendency', userId]`
- 변이(mutation)는 useMutation + invalidateQueries로 캐시 정리
- 로딩/에러/빈 상태는 컴포넌트 레벨에서 처리, 폴백 UI 필수 (REQ 3.2: loading/success/error/empty 4상태 구분)

## 폴더/파일 위치

- `src/features/<domain>/hooks/` — 도메인별 훅 (useGames, useTendencyResult ...)
- `src/lib/queryClient.ts` — QueryClient 설정

## 패턴

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// 기본 호출 경로는 자동 생성된 lib/api 함수 (함수명/경로는 Swagger 후 확정 예시)
import { searchGames } from '@/lib/api/games';
import { addToWishlist } from '@/lib/api/wishlist';

export function useSearchGames(query: string, filters: GameFilters) {
  return useQuery({
    queryKey: ['games', 'search', query, filters],
    queryFn: () => searchGames(query, filters),
    enabled: query.length > 0,
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}
```

## 안티패턴

- 서버 데이터를 Zustand에 저장
- queryKey를 단순 문자열만으로 (`'games'` 단독)
- 로딩 상태 무시하고 바로 `.map()` 호출 (REQ는 4상태 구분 강제)

## 관련 문서
- `api_client.md` (API 호출)
- `state_management.md` (클라이언트 상태와의 분리)
