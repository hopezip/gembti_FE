import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

type EditableField = 'nickname' | 'birthdate' | 'gender';

export function BasicInfoCard({ profile }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [fieldValue, setFieldValue] = useState('');

  const mutation = useMutation({
    mutationFn: (patch: Partial<MockUserProfile>) =>
      ky.patch('/api/mypage/profile', { json: patch }).json<MockUserProfile>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['mypage', 'profile'], updated);
      setEditingField(null);
    },
  });

  function startEdit(field: EditableField) {
    setEditingField(field);
    setFieldValue(
      field === 'gender' ? (profile.gender ?? '') : (profile[field] ?? ''),
    );
  }

  function handleSave() {
    if (!editingField) return;
    const value =
      editingField === 'gender'
        ? fieldValue || null
        : fieldValue.trim() || null;
    mutation.mutate({ [editingField]: value });
  }

  const rowCss = css({
    display: 'flex',
    alignItems: 'center',
    py: '2.5',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    gap: '3',
    _last: { borderBottom: 'none' },
  });
  const labelCss = css({
    fontSize: 'xs',
    color: 'fg.subtle',
    minW: '16',
    flexShrink: 0,
  });
  const valueCss = css({ fontSize: 'sm', color: 'fg.default', flex: 1 });
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
  const saveBtnCss = css({
    fontSize: 'xs',
    color: 'white',
    bg: 'accent.default',
    border: 'none',
    borderRadius: 'md',
    px: '3',
    py: '1',
    cursor: 'pointer',
    flexShrink: 0,
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
  });
  const cancelBtnCss = css({
    fontSize: 'xs',
    color: 'fg.subtle',
    bg: 'transparent',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  });
  const changeBtnCss = css({
    fontSize: 'xs',
    color: 'accent.fg',
    bg: 'transparent',
    border: 'none',
    cursor: 'pointer',
    px: '2',
    py: '1',
    _hover: { opacity: '0.7' },
  });
  const badgeCss = css({
    fontSize: 'xs',
    px: '2',
    py: '0.5',
    bg: 'bg.surfaceRaised',
    border: '1px solid',
    borderColor: 'border.emphasized',
    borderRadius: 'sm',
    color: 'fg.default',
  });

  function EditButtons() {
    return (
      <>
        <button
          type="button"
          onClick={handleSave}
          disabled={mutation.isPending}
          className={saveBtnCss}
        >
          저장
        </button>
        <button
          type="button"
          onClick={() => setEditingField(null)}
          className={cancelBtnCss}
        >
          취소
        </button>
      </>
    );
  }

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
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '4',
        })}
      >
        <span
          className={css({
            fontSize: 'sm',
            fontWeight: 'semibold',
            color: 'fg.default',
          })}
        >
          기본 정보
        </span>
        <button
          type="button"
          onClick={() => navigate('/mypage/edit')}
          className={css({
            fontSize: 'xs',
            color: 'accent.fg',
            bg: 'transparent',
            border: 'none',
            cursor: 'pointer',
            _hover: { opacity: '0.7' },
          })}
        >
          편집 &rsaquo;
        </button>
      </div>

      <div className={css({ display: 'flex', flexDirection: 'column' })}>
        {/* 이메일 */}
        <div className={rowCss}>
          <span className={labelCss}>이메일</span>
          <span className={valueCss}>{profile.email}</span>
          <span
            className={css({
              fontSize: 'xs',
              color: 'fg.subtle',
              px: '2',
              py: '0.5',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 'sm',
            })}
          >
            잠금
          </span>
        </div>

        {/* 닉네임 */}
        <div className={rowCss}>
          <span className={labelCss}>닉네임</span>
          {editingField === 'nickname' ? (
            <>
              <input
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                className={inputCss}
                // biome-ignore lint/a11y/noAutofocus: 인라인 편집 UX상 자동 포커스 필요
                autoFocus
              />
              <EditButtons />
            </>
          ) : (
            <>
              <span className={valueCss}>{profile.nickname}</span>
              <button
                type="button"
                onClick={() => startEdit('nickname')}
                className={changeBtnCss}
              >
                변경
              </button>
            </>
          )}
        </div>

        {/* 생년월일 */}
        <div className={rowCss}>
          <span className={labelCss}>생년월일</span>
          {editingField === 'birthdate' ? (
            <>
              <input
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                placeholder="YYYY.MM.DD"
                className={inputCss}
                // biome-ignore lint/a11y/noAutofocus: 인라인 편집 UX상 자동 포커스 필요
                autoFocus
              />
              <EditButtons />
            </>
          ) : (
            <>
              <span className={valueCss}>{profile.birthdate ?? '미설정'}</span>
              <button
                type="button"
                onClick={() => startEdit('birthdate')}
                className={changeBtnCss}
              >
                변경
              </button>
            </>
          )}
        </div>

        {/* 성별 */}
        <div className={rowCss}>
          <span className={labelCss}>성별</span>
          {editingField === 'gender' ? (
            <>
              <select
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
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
              <EditButtons />
            </>
          ) : (
            <>
              <span className={valueCss}>{profile.gender ?? '미설정'}</span>
              <button
                type="button"
                onClick={() => startEdit('gender')}
                className={changeBtnCss}
              >
                변경
              </button>
            </>
          )}
        </div>

        {/* 인증 */}
        <div className={rowCss}>
          <span className={labelCss}>인증</span>
          <div className={css({ display: 'flex', gap: '2', flex: 1 })}>
            <span className={badgeCss}>이메일</span>
            {profile.steamConnected && <span className={badgeCss}>Steam</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
