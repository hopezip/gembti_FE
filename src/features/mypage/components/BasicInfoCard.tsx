import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { Input } from '@/components/ui/Input';
import { updateMyProfile } from '@/features/mypage/api/mypage';
import { BIRTH_MIN_DATE, getBirthMaxDateForAge } from '@/lib/schemas/auth';
import type { MockUserProfile } from '@/mocks/handlers/mypage';
import { checkNickname as checkNicknameApi } from '@/services/users';

type NicknameCheckStatus = 'idle' | 'checking' | 'available' | 'taken';

// 생년월일 허용 범위: 1900-01-01 ~ 만 15세 컷오프(오늘로부터 15년 전). 가입 만 15세 정책과 정합(MYPAGE-FE-017).
const BIRTH_MAX_DATE = getBirthMaxDateForAge(15);

// 생년월일은 가입 이후 변경 불가가 원칙이나, 위 범위 밖(미래·너무 어림·1900 이전)이거나 미설정인 경우에 한해
//   1회 수정을 허용한다(잘못 들어간 값 자가 교정용). 올바른 값으로 저장하면 다음부터 다시 잠긴다.
function isValidBirthdate(v: string | null | undefined): boolean {
  if (!v || !/^\d{4}-\d{2}-\d{2}/.test(v)) return false;
  return v >= BIRTH_MIN_DATE && v <= BIRTH_MAX_DATE;
}

interface Props {
  profile: MockUserProfile;
}

export function BasicInfoCard({ profile }: Props) {
  const queryClient = useQueryClient();
  // 편집 모드 진입 시 전체 필드를 한 번에 수정한다(항목별 인라인 편집에서 전환).
  const [isEditMode, setIsEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [nicknameCheck, setNicknameCheck] =
    useState<NicknameCheckStatus>('idle');
  // 현재 생일이 유효 범위(1900~만 15세) 밖이면 1회 수정을 허용한다.
  const birthdateCorrectable = !isValidBirthdate(profile.birthdate);
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
    setBirthdate(profile.birthdate ?? '');
    setNicknameCheck('idle');
    setSaveError('');
    setIsEditMode(true);
  }

  async function checkNickname() {
    if (!nickname.trim()) return;
    setNicknameCheck('checking');
    try {
      const res = await checkNicknameApi(nickname.trim());
      setNicknameCheck(res.available ? 'available' : 'taken');
    } catch {
      setNicknameCheck('idle');
    }
  }

  // 닉네임을 실제로 변경한 경우에만 중복 확인을 통과해야 저장할 수 있다.
  const nicknameChanged = nickname.trim() !== (profile.nickname ?? '');

  function handleSave() {
    // 생년월일은 가입 시 고정값이라 보통 전송하지 않는다.
    //   단, 현재 값이 허용 범위(1900~만 15세) 밖이라 1회 교정이 허용된 경우에만 birthdate를 함께 보낸다.
    setSaveError('');
    mutation.mutate({
      nickname: nickname.trim(),
      gender: (gender || null) as MockUserProfile['gender'],
      ...(birthdateCorrectable ? { birthdate: birthdate.trim() } : {}),
    });
  }

  const canSave =
    !mutation.isPending &&
    nickname.trim().length > 0 &&
    (!nicknameChanged || nicknameCheck === 'available') &&
    // 교정 모드에서는 1900~만 15세 범위의 올바른 날짜를 입력해야 저장할 수 있다.
    (!birthdateCorrectable || isValidBirthdate(birthdate));

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
                      !nickname.trim() ||
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
                      nicknameCheck === 'taken' ? 'danger.fg' : 'green.500',
                  })}
                >
                  {nicknameCheck === 'available' && '사용 가능한 닉네임입니다'}
                  {nicknameCheck === 'taken' && '이미 사용 중인 닉네임입니다'}
                </span>
              </div>
            ) : (
              <span className={valueCss}>{profile.nickname}</span>
            )}
          </div>

          {/* 생년월일 — 가입 시 입력값으로 고정(읽기 전용). 단 값이 1900~만 15세 밖이면 1회 교정 허용. */}
          <div className={rowCss}>
            <span className={labelCss}>생년월일</span>
            {isEditMode && birthdateCorrectable ? (
              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minW: 0,
                })}
              >
                <Input
                  size="sm"
                  type="date"
                  min={BIRTH_MIN_DATE}
                  max={BIRTH_MAX_DATE}
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className={css({ minW: 0, colorScheme: 'dark' })}
                />
                <span
                  className={css({
                    mt: '1',
                    fontSize: 'xs',
                    color: 'fg.subtle',
                  })}
                >
                  생년월일이 올바르지 않아 1회 수정할 수 있어요 (만 15세 이상)
                </span>
              </div>
            ) : (
              <>
                <span className={valueCss}>
                  {profile.birthdate ?? '미설정'}
                </span>
                {isEditMode && (
                  <span
                    className={css({
                      fontSize: 'xs',
                      color: 'fg.subtle',
                      flexShrink: 0,
                    })}
                  >
                    가입 시 입력값 · 변경 불가
                  </span>
                )}
              </>
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
