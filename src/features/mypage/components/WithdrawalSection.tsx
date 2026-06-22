import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { Input } from '@/components/ui/Input';
import { withdrawMe } from '@/features/mypage/api/mypage';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { logout } from '@/services/auth';

// 회원탈퇴 섹션 (MYPAGE-FE-011). DELETE /api/v1/auth/withdrawal → 세션 정리 후 홈 이동.
//   "회원 탈퇴" 클릭 시 확인 모달을 띄워 한 번 더 확인받는다.
//   이메일 계정은 비밀번호 입력·일치가 필수(틀리면 백엔드가 에러 반환).
//   steam 소셜로그인 계정은 비밀번호가 없어 입력 없이 바로 탈퇴한다.
export function WithdrawalSection({
  loginProvider,
}: {
  loginProvider: 'email' | 'steam' | null;
}) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  // steam 외(email·미상)는 비밀번호가 있는 계정이라 입력·일치를 요구한다.
  const needsPassword = loginProvider !== 'steam';

  const mutation = useMutation({
    mutationFn: () =>
      withdrawMe({
        password: password.trim() || null,
        reason: null,
        detail: null,
      }),
    onSuccess: async () => {
      // 탈퇴 후 토큰/쿠키 정리(서버 logout 실패해도 클라 상태는 비운다).
      await logout().catch(() => {});
      clearAuth();
      navigate('/');
    },
  });

  // 모달 닫기 — 처리 중에는 막고, 닫을 때 입력·에러 상태를 초기화한다.
  const closeModal = () => {
    if (mutation.isPending) return;
    setOpen(false);
    setPassword('');
    mutation.reset();
  };

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
        <Button
          variant="dangerSolid"
          size="sm"
          onClick={() => setOpen(true)}
          className={css({
            flexShrink: 0,
            '@media (max-width: 768px)': {
              alignSelf: 'flex-end',
            },
          })}
        >
          회원 탈퇴
        </Button>
      </div>

      {open && (
        <WithdrawalConfirmModal
          needsPassword={needsPassword}
          password={password}
          onPasswordChange={setPassword}
          isPending={mutation.isPending}
          isError={mutation.isError}
          confirmDisabled={
            mutation.isPending || (needsPassword && !password.trim())
          }
          onConfirm={() => mutation.mutate()}
          onClose={closeModal}
        />
      )}
    </Card>
  );
}

const overlay = css({
  position: 'fixed',
  inset: '0',
  zIndex: '[9999]',
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: '6',
});

const modal = css({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  w: 'full',
  maxW: '420px',
  bg: 'bg.surface',
  borderRadius: '2xl',
  border: '1px solid token(colors.border.default)',
  boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
  p: '6',
});

const closeBtn = css({
  position: 'absolute',
  top: '4',
  right: '4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '8',
  h: '8',
  borderRadius: 'full',
  bg: 'bg.surfaceRaised',
  color: 'fg.subtle',
  border: 'none',
  cursor: 'pointer',
  _hover: { color: 'fg.default' },
});

// 회원탈퇴 확인 모달 — GameMediaLightbox의 오버레이/포털 패턴을 따른다(별도 Dialog 컴포넌트 없음).
function WithdrawalConfirmModal({
  needsPassword,
  password,
  onPasswordChange,
  isPending,
  isError,
  confirmDisabled,
  onConfirm,
  onClose,
}: {
  needsPassword: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  isPending: boolean;
  isError: boolean;
  confirmDisabled: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: 모달 백드롭 — ESC 키는 useEffect 핸들러가 담당
    // biome-ignore lint/a11y/useKeyWithClickEvents: 동상
    <div className={overlay} onClick={onClose}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 클릭 버블링 차단용 — ESC는 useEffect 핸들러가 담당 */}
      <div
        className={modal}
        role="dialog"
        aria-modal="true"
        aria-label="회원 탈퇴 확인"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={16} />
        </button>

        <p
          className={css({
            fontSize: 'md',
            fontWeight: 'bold',
            color: 'fg.default',
          })}
        >
          회원 탈퇴
        </p>
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
            onChange={(e) => onPasswordChange(e.target.value)}
          />
        )}
        {isError && (
          <span className={css({ fontSize: 'xs', color: 'danger.fg' })}>
            탈퇴 처리에 실패했어요. 비밀번호를 확인해 주세요.
          </span>
        )}

        <div
          className={css({
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '2',
            mt: '1',
          })}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="dangerSolid"
            size="sm"
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {isPending ? '처리 중...' : '탈퇴하기'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
