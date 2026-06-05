import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

type EditState = {
  nickname: string;
  email: string;
  birthdate: string;
  gender: '남성' | '여성' | '기타' | '';
};

export function BasicInfoCard({ profile }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditState>({
    nickname: '',
    email: '',
    birthdate: '',
    gender: '',
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    setForm({
      nickname: profile.nickname,
      email: profile.email,
      birthdate: profile.birthdate ?? '',
      gender: profile.gender ?? '',
    });
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (patch: Partial<MockUserProfile>) =>
      ky.patch('/api/mypage/profile', { json: patch }).json<MockUserProfile>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['mypage', 'profile'], updated);
      setIsEditing(false);
    },
  });

  function handleSave() {
    mutation.mutate({
      nickname: form.nickname.trim(),
      email: form.email.trim(),
      birthdate: form.birthdate.trim(),
      gender: (form.gender as MockUserProfile['gender']) || null,
    });
  }

  function handleCancel() {
    setForm({
      nickname: profile.nickname,
      email: profile.email,
      birthdate: profile.birthdate ?? '',
      gender: profile.gender ?? '',
    });
    setIsEditing(false);
  }

  const inputCss = css({
    flex: 1,
    bg: 'bg.surfaceRaised',
    border: '1px solid',
    borderColor: 'accent.default',
    borderRadius: 'md',
    px: '3',
    py: '1.5',
    fontSize: 'sm',
    color: 'fg.default',
    outline: 'none',
  });

  const rows: { label: string; key: keyof EditState }[] = [
    { label: '이메일', key: 'email' },
    { label: '닉네임', key: 'nickname' },
    { label: '생년월일', key: 'birthdate' },
    { label: '성별', key: 'gender' },
  ];

  const displayValues: Record<keyof EditState, string> = {
    email: profile.email,
    nickname: profile.nickname,
    birthdate: profile.birthdate ?? '미설정',
    gender: profile.gender ?? '미설정',
  };

  return (
    <div
      className={css({
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'xl',
        p: '5',
      })}
    >
      {/* 헤더 */}
      <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '4' })}>
        <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'fg.default' })}>기본 정보</span>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={css({
              fontSize: 'xs', color: 'accent.fg', bg: 'transparent', border: 'none', cursor: 'pointer',
              _hover: { opacity: '0.7' },
            })}
          >
            편집
          </button>
        ) : (
          <div className={css({ display: 'flex', gap: '2' })}>
            <button
              type="button"
              onClick={handleCancel}
              className={css({
                fontSize: 'xs', color: 'fg.subtle', bg: 'transparent', border: 'none', cursor: 'pointer',
              })}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={mutation.isPending}
              className={css({
                fontSize: 'xs', color: 'white', bg: 'accent.default', border: 'none',
                borderRadius: 'md', px: '3', py: '1', cursor: 'pointer',
                _disabled: { opacity: '0.5', cursor: 'not-allowed' },
              })}
            >
              저장
            </button>
          </div>
        )}
      </div>

      {/* 필드 목록 */}
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '0' })}>
        {rows.map(({ label, key }) => (
          <div
            key={key}
            className={css({
              display: 'flex',
              alignItems: 'center',
              py: '2.5',
              borderBottom: '1px solid',
              borderColor: 'border.default',
              gap: '3',
              _last: { borderBottom: 'none' },
            })}
          >
            <span className={css({ fontSize: 'xs', color: 'fg.subtle', minW: '16', flexShrink: 0 })}>
              {label}
            </span>
            {isEditing ? (
              key === 'gender' ? (
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as EditState['gender'] }))}
                  className={css({
                    flex: 1,
                    bg: 'bg.surfaceRaised',
                    border: '1px solid',
                    borderColor: 'accent.default',
                    borderRadius: 'md',
                    px: '3',
                    py: '1.5',
                    fontSize: 'sm',
                    color: 'fg.default',
                    outline: 'none',
                    cursor: 'pointer',
                  })}
                >
                  <option value="">미설정</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                </select>
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  readOnly={key === 'email'}
                  className={`${inputCss}${key === 'email' ? ` ${css({ opacity: '0.6', cursor: 'not-allowed' })}` : ''}`}
                />
              )
            ) : (
              <span className={css({ fontSize: 'sm', color: 'fg.default', flex: 1 })}>
                {displayValues[key]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
