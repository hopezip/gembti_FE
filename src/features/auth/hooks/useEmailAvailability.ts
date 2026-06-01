import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { checkEmailAvailability } from '@/services/auth';

// 이메일 실시간 중복확인(LOGIN-FE-004, LOGIN-FE-003에서 미뤘던 d 항목).
// STEP1 이메일 필드에 연결한다. 입력을 debounce(기본 400ms)한 뒤 형식이 통과하면
// checkEmailAvailability를 호출한다. 실패(네트워크/4xx)는 'error'로 degrade하며
// 가입을 막지 않는다(서버 409가 최종 안전망).

const DEFAULT_DEBOUNCE_MS = 400;
const emailFormat = z.string().email();

export type EmailAvailabilityStatus =
  | 'idle' // 입력 없음/형식 미통과 — 표시 안 함
  | 'checking' // 확인 중
  | 'available' // 사용 가능
  | 'taken' // 이미 사용 중
  | 'error'; // 확인 불가(가입은 허용)

interface UseEmailAvailabilityResult {
  status: EmailAvailabilityStatus;
  /** 'taken'일 때만 true. SignupForm 제출 보조 차단에 사용. */
  isTaken: boolean;
}

export function useEmailAvailability(
  email: string,
  debounceMs: number = DEFAULT_DEBOUNCE_MS,
): UseEmailAvailabilityResult {
  const trimmed = email.trim();
  const isValidFormat = emailFormat.safeParse(trimmed).success;

  // debounce — 입력이 멈춘 뒤에만 쿼리 대상 이메일을 확정한다.
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
    queryKey: ['email-availability', debounced],
    queryFn: () => checkEmailAvailability(debounced),
    enabled: debounced.length > 0,
    // 중복확인은 보조 표시라 재시도 없이 빠르게 결과를 낸다(실패 시 degrade).
    retry: false,
    staleTime: 60_000,
  });

  let status: EmailAvailabilityStatus = 'idle';
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
