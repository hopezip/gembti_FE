import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { Input } from '@/components/ui/Input';
import { withdrawMe } from '@/features/mypage/api/mypage';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { logout } from '@/services/auth';

// 회원탈퇴 섹션 (MYPAGE-FE-011). DELETE /api/v1/auth/withdrawal → 세션 정리 후 홈 이동.
//   이메일 계정은 비밀번호 입력·일치가 필수(틀리면 백엔드가 에러 반환).
//   steam 소셜로그인 계정은 비밀번호가 없어 입력 없이 바로 탈퇴한다.
export function WithdrawalSection({
  loginProvider,
}: {
  loginProvider: 'email' | 'steam' | null;
}) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  // steam 외(email·미상)는 비밀번호가 있는 계정이라 입력·일치를 요구한다.
  const needsPassword = loginProvider !== 'steam';

  const mutation = useMutation({
    mutationFn: () =>
      withdrawMe({ password: password.trim() || null, reason: null, detail: null }),
    onSuccess: async () => {
      // 탈퇴 후 토큰/쿠키 정리(서버 logout 실패해도 클라 상태는 비운다).
      await logout().catch(() => {});
      clearAuth();
      navigate('/');
    },
  });

  return (
    <Card
      padding="md"
      className={css({
        '@media (max-width: 768px)': {
          p: '3',
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4',
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '3',
          },
        })}
      >
        <div className={css({ minW: 0 })}>
          <p
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'fg.default',
            })}
          >
            회원 탈퇴
          </p>
          <p className={css({ fontSize: 'xs', color: 'fg.subtle', mt: '1' })}>
            탈퇴 시 계정과 활동 정보가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        {!confirming && (
          <Button
            variant="dangerSolid"
            size="sm"
            onClick={() => setConfirming(true)}
            className={css({
              flexShrink: 0,
              '@media (max-width: 768px)': {
                alignSelf: 'flex-end',
              },
            })}
          >
            회원 탈퇴
          </Button>
        )}
      </div>

      {confirming && (
        <div
          className={css({
            mt: '4',
            pt: '4',
            borderTop: '1px solid',
            borderColor: 'border.default',
            display: 'flex',
            flexDirection: 'column',
            gap: '3',
          })}
        >
          <p className={css({ fontSize: 'sm', color: 'fg.muted' })}>
            정말 탈퇴하시겠어요? 탈퇴하면 계정과 활동 정보가 삭제되며 되돌릴 수
            없습니다.
          </p>
          {needsPassword && (
            <Input
              size="sm"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
          {mutation.isError && (
            <span className={css({ fontSize: 'xs', color: 'danger.fg' })}>
              탈퇴 처리에 실패했어요. 비밀번호를 확인해 주세요.
            </span>
          )}
          <div
            className={css({
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '2',
            })}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button
              variant="dangerSolid"
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || (needsPassword && !password.trim())}
            >
              {mutation.isPending ? '처리 중...' : '탈퇴하기'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
