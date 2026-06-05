import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

type NicknameCheckStatus = 'idle' | 'checking' | 'available' | 'taken';

interface Props {
  profile: MockUserProfile;
}

type EditableField = 'nickname' | 'birthdate' | 'gender';

export function BasicInfoCard({ profile }: Props) {
  const queryClient = useQueryClient();
  // 편집 모드 여부 (변경 버튼 노출)
  const [isEditMode, setIsEditMode] = useState(false);
  // 현재 인라인 편집 중인 필드
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [nicknameCheck, setNicknameCheck] =
    useState<NicknameCheckStatus>('idle');

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
    setNicknameCheck('idle');
  }

  async function checkNickname() {
    if (!fieldValue.trim()) return;
    setNicknameCheck('checking');
    try {
      const res = await ky
        .get('/api/users/check-nickname', {
          searchParams: { nickname: fieldValue.trim() },
        })
        .json<{ available: boolean }>();
      setNicknameCheck(res.available ? 'available' : 'taken');
    } catch {
      setNicknameCheck('idle');
    }
  }

  function handleSave() {
    if (!editingField) return;
    const value =
      editingField === 'gender'
        ? fieldValue || null
        : fieldValue.trim() || null;
    mutation.mutate({ [editingField]: value });
  }

  function handleClose() {
    setEditingField(null);
    setIsEditMode(false);
  }

  const rowCss = css({
    display: 'flex',
    alignItems: 'center',
    py: '2.5',
    borderBottom: '1px solid',
    borderColor: 'border.default',
    gap: '2',
    _last: { borderBottom: 'none' },
  });
  const labelCss = css({
    fontSize: 'xs',
    color: 'fg.subtle',
    minW: '14',
    flexShrink: 0,
  });
  const valueCss = css({
    fontSize: 'sm',
    color: 'fg.default',
    flex: 1,
    minW: 0,
  });
  const inputCss = css({
    flex: 1,
    minW: 0,
    bg: 'bg.surfaceRaised',
    border: '1px solid',
    borderColor: 'accent.default',
    borderRadius: 'md',
    px: '2',
    py: '1',
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
    px: '2',
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
    px: '1.5',
    py: '0.5',
    flexShrink: 0,
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

  return (
    <div
      className={css({
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'xl',
        p: '5',
        h: 'full',
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
        {!isEditMode ? (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
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
        ) : (
          <button
            type="button"
            onClick={handleClose}
            className={css({
              fontSize: 'xs',
              color: 'fg.subtle',
              bg: 'transparent',
              border: 'none',
              cursor: 'pointer',
              _hover: { opacity: '0.7' },
            })}
          >
            닫기
          </button>
        )}
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
              px: '1.5',
              py: '0.5',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 'sm',
              flexShrink: 0,
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
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minW: 0,
                  gap: '1',
                })}
              >
                <input
                  value={fieldValue}
                  onChange={(e) => {
                    setFieldValue(e.target.value);
                    setNicknameCheck('idle');
                  }}
                  className={inputCss}
                  // biome-ignore lint/a11y/noAutofocus: 인라인 편집 UX
                  autoFocus
                />
                {nicknameCheck === 'available' && (
                  <span className={css({ fontSize: 'xs', color: 'green.500' })}>
                    사용 가능한 닉네임입니다
                  </span>
                )}
                {nicknameCheck === 'taken' && (
                  <span className={css({ fontSize: 'xs', color: 'danger.fg' })}>
                    이미 사용 중인 닉네임입니다
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={checkNickname}
                disabled={nicknameCheck === 'checking' || !fieldValue.trim()}
                className={css({
                  fontSize: 'xs',
                  color: 'fg.default',
                  bg: 'bg.surfaceRaised',
                  border: '1px solid',
                  borderColor: 'border.emphasized',
                  borderRadius: 'md',
                  px: '2',
                  py: '1',
                  cursor: 'pointer',
                  flexShrink: 0,
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                {nicknameCheck === 'checking' ? '확인 중...' : '중복 확인'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={mutation.isPending || nicknameCheck !== 'available'}
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
          ) : (
            <>
              <span className={valueCss}>{profile.nickname}</span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => startEdit('nickname')}
                  className={changeBtnCss}
                >
                  변경
                </button>
              )}
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
                // biome-ignore lint/a11y/noAutofocus: 인라인 편집 UX
                autoFocus
              />
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
          ) : (
            <>
              <span className={valueCss}>{profile.birthdate ?? '미설정'}</span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => startEdit('birthdate')}
                  className={changeBtnCss}
                >
                  변경
                </button>
              )}
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
                  minW: 0,
                  bg: 'bg.surfaceRaised',
                  border: '1px solid',
                  borderColor: 'accent.default',
                  borderRadius: 'md',
                  px: '2',
                  py: '1',
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
          ) : (
            <>
              <span className={valueCss}>{profile.gender ?? '미설정'}</span>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => startEdit('gender')}
                  className={changeBtnCss}
                >
                  변경
                </button>
              )}
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
