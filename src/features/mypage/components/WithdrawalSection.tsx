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
//   비밀번호는 이메일 가입자만 필요(소셜/스팀 가입자는 비워 둔다). 사유는 선택.
export function WithdrawalSection() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      withdrawMe({
        password: password.trim() || null,
        reason: reason.trim() || null,
        detail: null,
      }),
    onSuccess: async () => {
      // 탈퇴 후 토큰/쿠키 정리(서버 logout 실패해도 클라 상태는 비운다).
      await logout().catch(() => {});
      clearAuth();
      navigate('/');
    },
  });

  return (
    <Card padding="md">
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4',
        })}
      >
        <div>
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
          <Input
            size="sm"
            type="password"
            placeholder="비밀번호 (이메일 가입자만)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            size="sm"
            placeholder="탈퇴 사유 (선택)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
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
              disabled={mutation.isPending}
            >
              {mutation.isPending ? '처리 중...' : '탈퇴하기'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
