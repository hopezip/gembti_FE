import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { Input } from '@/components/ui/Input';
import { updateMyProfile } from '@/features/mypage/api/mypage';
import { nicknameSchema } from '@/lib/schemas/auth';
import type { MockUserProfile } from '@/mocks/handlers/mypage';
import { checkNickname as checkNicknameApi } from '@/services/users';

// 'error'는 409 외 실패(400/422/네트워크) — 무반응 대신 안내를 띄운다(LOGIN-FE-017).
type NicknameCheckStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'error';

interface Props {
  profile: MockUserProfile;
}

export function BasicInfoCard({ profile }: Props) {
  const queryClient = useQueryClient();
  // 편집 모드 진입 시 전체 필드를 한 번에 수정한다(항목별 인라인 편집에서 전환).
  const [isEditMode, setIsEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [nicknameCheck, setNicknameCheck] =
    useState<NicknameCheckStatus>('idle');
  // 저장 실패를 사용자에게 표면화하기 위한 에러 메시지(닉네임 저장 먹통 방지).
  const [saveError, setSaveError] = useState('');

  const mutation = useMutation({
    mutationFn: (patch: Partial<MockUserProfile>) => updateMyProfile(patch),
    // updateMyProfile은 void(PATCH만 수행)이므로 프로필을 무효화해 실값으로 재조회·갱신한다.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mypage', 'profile'] });
      setIsEditMode(false);
    },
    // 저장 실패 시 조용히 끝나지 않도록 에러를 화면에 노출한다.
    onError: () => {
      setSaveError('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    },
  });

  function enterEdit() {
    setNickname(profile.nickname ?? '');
    setGender(profile.gender ?? '');
    setNicknameCheck('idle');
    setSaveError('');
    setIsEditMode(true);
  }

  // 닉네임이 스키마(2~8자, 특수기호 불가)를 통과할 때만 중복확인을 호출한다(LOGIN-FE-017).
  const isNicknameValid = nicknameSchema.safeParse(nickname.trim()).success;

  async function checkNickname() {
    if (!isNicknameValid) return;
    setNicknameCheck('checking');
    try {
      const res = await checkNicknameApi(nickname.trim());
      setNicknameCheck(res.available ? 'available' : 'taken');
    } catch {
      // 409 외 실패(형식 거부/네트워크) — 무반응 대신 에러 안내.
      setNicknameCheck('error');
    }
  }

  // 닉네임을 실제로 변경한 경우에만 중복 확인을 통과해야 저장할 수 있다.
  const nicknameChanged = nickname.trim() !== (profile.nickname ?? '');
  const genderChanged = (gender || null) !== (profile.gender ?? null);
  const hasChanges = nicknameChanged || genderChanged;

  function handleSave() {
    if (!hasChanges) {
      setIsEditMode(false);
      return;
    }
    // 생년월일은 가입 시 고정값이라 전송하지 않는다. 변경된 필드만 보내 중복 검증/불필요한 갱신을 피한다.
    setSaveError('');
    const patch: Partial<MockUserProfile> = {};
    if (nicknameChanged) patch.nickname = nickname.trim();
    if (genderChanged)
      patch.gender = (gender || null) as MockUserProfile['gender'];
    mutation.mutate(patch);
  }

  const canSave =
    !mutation.isPending &&
    hasChanges &&
    nickname.trim().length > 0 &&
    (!nicknameChanged || nicknameCheck === 'available');

  const rowCss = css({
    display: 'flex',
    alignItems: 'center',
    minH: '11', // 편집·비편집 모드 행 높이를 input 기준으로 통일
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
    alignSelf: 'center',
  });
  const valueCss = css({
    fontSize: 'sm',
    color: 'fg.default',
    flex: 1,
    minW: 0,
  });

  return (
    <Card padding="md" className={css({ h: 'full' })}>
      {/* 콘텐츠를 세로 flex로 채워 하단 버튼을 바닥에 고정(편집 진입 시 카드 높이 안정) */}
      <div
        className={css({ display: 'flex', flexDirection: 'column', h: 'full' })}
      >
        {/* 헤더 */}
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minH: '8', // 편집 버튼 유무와 무관하게 헤더 높이 고정
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
          {!isEditMode && (
            <Button variant="ghost" size="sm" onClick={enterEdit}>
              편집 &rsaquo;
            </Button>
          )}
        </div>

        <div className={css({ display: 'flex', flexDirection: 'column' })}>
          {/* 이메일 — 항상 읽기 전용(편집 불가) */}
          <div className={rowCss}>
            <span className={labelCss}>이메일</span>
            <span className={valueCss}>{profile.email}</span>
          </div>

          {/* 닉네임 */}
          <div className={rowCss}>
            <span className={labelCss}>닉네임</span>
            {isEditMode ? (
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minW: 0,
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Input
                    size="sm"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameCheck('idle');
                    }}
                    className={css({ flex: 1, minW: 0 })}
                    autoFocus
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={checkNickname}
                    disabled={
                      nicknameCheck === 'checking' ||
                      !isNicknameValid ||
                      !nicknameChanged
                    }
                  >
                    {nicknameCheck === 'checking' ? '확인 중...' : '중복 확인'}
                  </Button>
                </div>
                {/* 안내문구 고정 슬롯 — 메시지 유무로 레이아웃이 밀리지 않도록 항상 높이 확보 */}
                <span
                  className={css({
                    minH: '4',
                    mt: '1',
                    fontSize: 'xs',
                    color:
                      nicknameCheck === 'taken' || nicknameCheck === 'error'
                        ? 'danger.fg'
                        : 'green.500',
                  })}
                >
                  {nicknameCheck === 'available' && '사용 가능한 닉네임입니다'}
                  {nicknameCheck === 'taken' && '이미 사용 중인 닉네임입니다'}
                  {nicknameCheck === 'error' &&
                    '확인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
                </span>
              </div>
            ) : (
              <span className={valueCss}>{profile.nickname}</span>
            )}
          </div>

          {/* 생년월일 — 가입 시 입력값으로 고정(항상 읽기 전용, 변경 불가) */}
          <div className={rowCss}>
            <span className={labelCss}>생년월일</span>
            <span className={valueCss}>{profile.birthdate ?? '미설정'}</span>
            {isEditMode && (
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'fg.subtle',
                  flexShrink: 0,
                })}
              >
                변경 불가
              </span>
            )}
          </div>

          {/* 성별 */}
          <div className={rowCss}>
            <span className={labelCss}>성별</span>
            {isEditMode ? (
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
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
            ) : (
              <span className={valueCss}>{profile.gender ?? '미설정'}</span>
            )}
          </div>
        </div>

        {/* 하단 취소/저장 — mt:auto로 카드 바닥에 고정 */}
        {isEditMode && (
          <div
            className={css({
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '2',
              mt: 'auto',
              pt: '4',
            })}
          >
            {saveError && (
              <span
                className={css({
                  flex: 1,
                  fontSize: 'xs',
                  color: 'danger.fg',
                })}
              >
                {saveError}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditMode(false)}
              disabled={mutation.isPending}
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!canSave}
            >
              {mutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
