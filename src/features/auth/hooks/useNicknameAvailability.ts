import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { nicknameSchema } from '@/lib/schemas/auth';
import { checkNicknameAvailability } from '@/services/auth';

// 닉네임 실시간 중복확인 (LOGIN-FE-005 STEP2).
// 입력을 debounce(기본 400ms)한 뒤 형식(2~12자·특수기호 불가)이 통과하면 check-nickname을 호출한다.
// 실패(네트워크/4xx)는 'error'로 degrade하며 가입을 막지 않는다(서버 NICKNAME_DUPLICATED가 최종 안전망).
// useEmailAvailability와 동일 패턴 — 형식 게이트만 닉네임 스키마로 바꿨다.

const DEFAULT_DEBOUNCE_MS = 400;

export type NicknameAvailabilityStatus =
  | 'idle' // 입력 없음/형식 미통과 — 표시 안 함
  | 'checking' // 확인 중
  | 'available' // 사용 가능
  | 'taken' // 이미 사용 중
  | 'error'; // 확인 불가(가입은 허용)

interface UseNicknameAvailabilityResult {
  status: NicknameAvailabilityStatus;
  /** 'taken'일 때만 true. 제출 보조 차단에 사용. */
  isTaken: boolean;
}

export function useNicknameAvailability(
  nickname: string,
  debounceMs: number = DEFAULT_DEBOUNCE_MS,
): UseNicknameAvailabilityResult {
  const trimmed = nickname.trim();
  const isValidFormat = nicknameSchema.safeParse(trimmed).success;

  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    if (!isValidFormat) {
      setDebounced('');
      return;
    }
    const id = setTimeout(() => setDebounced(trimmed), debounceMs);
    return () => clearTimeout(id);
  }, [trimmed, isValidFormat, debounceMs]);

  const query = useQuery({
    queryKey: ['nickname-availability', debounced],
    queryFn: () => checkNicknameAvailability(debounced),
    enabled: debounced.length > 0,
    retry: false,
    staleTime: 60_000,
  });

  let status: NicknameAvailabilityStatus = 'idle';
  if (!isValidFormat || debounced.length === 0) {
    status = 'idle';
  } else if (query.isPending || query.isFetching) {
    status = 'checking';
  } else if (query.isError) {
    status = 'error';
  } else if (query.data) {
    status = query.data.available ? 'available' : 'taken';
  }

  return { status, isTaken: status === 'taken' };
}
