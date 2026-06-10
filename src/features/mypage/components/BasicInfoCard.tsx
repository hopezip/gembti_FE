import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
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
    // gender는 빈 값 그대로(null), 나머지(nickname/birthdate)는 trim. birthdate는 ISO YYYY-MM-DD.
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

  return (
    <Card padding="md" className={css({ h: 'full' })}>
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
          <Button variant="ghost" size="sm" onClick={() => setIsEditMode(true)}>
            편집 &rsaquo;
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleClose}>
            닫기
          </Button>
        )}
      </div>

      <div className={css({ display: 'flex', flexDirection: 'column' })}>
        {/* 이메일 */}
        <div className={rowCss}>
          <span className={labelCss}>이메일</span>
          <span className={valueCss}>{profile.email}</span>
          <Tag tone="neutral">잠금</Tag>
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
                <Input
                  size="sm"
                  value={fieldValue}
                  onChange={(e) => {
                    setFieldValue(e.target.value);
                    setNicknameCheck('idle');
                  }}
                  className={css({ flex: 1, minW: 0 })}
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
              <Button
                variant="secondary"
                size="sm"
                onClick={checkNickname}
                disabled={nicknameCheck === 'checking' || !fieldValue.trim()}
              >
                {nicknameCheck === 'checking' ? '확인 중...' : '중복 확인'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={mutation.isPending || nicknameCheck !== 'available'}
              >
                저장
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <span className={valueCss}>{profile.nickname}</span>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit('nickname')}
                >
                  변경
                </Button>
              )}
            </>
          )}
        </div>

        {/* 생년월일 */}
        <div className={rowCss}>
          <span className={labelCss}>생년월일</span>
          {editingField === 'birthdate' ? (
            <>
              {/* 회원가입(STEP2)과 동일하게 type=date 달력으로 통일 (MYPAGE-FE-004). 값은 ISO YYYY-MM-DD. */}
              <Input
                size="sm"
                type="date"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                className={css({ flex: 1, minW: 0, colorScheme: 'dark' })}
                // biome-ignore lint/a11y/noAutofocus: 인라인 편집 UX
                autoFocus
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={mutation.isPending || !fieldValue}
              >
                저장
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <span className={valueCss}>{profile.birthdate ?? '미설정'}</span>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit('birthdate')}
                >
                  변경
                </Button>
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
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={mutation.isPending}
              >
                저장
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingField(null)}
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <span className={valueCss}>{profile.gender ?? '미설정'}</span>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit('gender')}
                >
                  변경
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
