import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { css } from 'styled-system/css';
import { Card } from '@/components/ui/GameCard';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

const NICKNAME_MAX = 20;

function validateNickname(value: string): string | null {
  const t = value.trim();
  if (t.length < 2) return '닉네임은 2자 이상이어야 합니다.';
  if (t.length > NICKNAME_MAX)
    return `닉네임은 ${NICKNAME_MAX}자 이하여야 합니다.`;
  if (/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ_\s]/.test(t))
    return '특수문자는 사용할 수 없습니다.';
  return null;
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['mypage', 'profile'],
    queryFn: () => ky.get('/api/mypage/profile').json<MockUserProfile>(),
  });

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState<'남성' | '여성' | '기타' | ''>('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname);
    setEmail(profile.email);
    setBirthdate(profile.birthdate ?? '');
    setGender(profile.gender ?? '');
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (patch: Partial<MockUserProfile>) =>
      ky.patch('/api/mypage/profile', { json: patch }).json<MockUserProfile>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['mypage', 'profile'], updated);
      setIsDirty(false);
      navigate('/mypage');
    },
  });

  function handleChange<T extends string>(setter: (v: T) => void) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value as T);
      setIsDirty(true);
    };
  }

  function handleSave() {
    if (!profile || validateNickname(nickname)) return;
    mutation.mutate({
      nickname: nickname.trim(),
      birthdate: birthdate.trim(),
      gender: (gender as MockUserProfile['gender']) || null,
    });
  }

  if (isLoading || !profile) {
    return (
      <div className={css({ p: '8', color: 'fg.subtle' })}>로딩 중...</div>
    );
  }

  const nicknameError = validateNickname(nickname);
  const initials = (nickname || profile.nickname).slice(0, 2).toUpperCase();

  return (
    <div className={css({ maxW: '1200px', mx: 'auto', px: '6', py: '8' })}>
      {/* 헤더 */}
      <div className={css({ mb: '6' })}>
        <h1
          className={css({
            fontSize: '2xl',
            fontWeight: 'bold',
            color: 'fg.default',
            mb: '1',
          })}
        >
          프로필 편집
        </h1>
        <p className={css({ fontSize: 'sm', color: 'fg.subtle' })}>
          회원님의 프로필 정보를 수정합니다
        </p>
      </div>

      {/* 탭 */}
      <div
        className={css({
          borderBottom: '1px solid',
          borderColor: 'border.default',
          mb: '6',
        })}
      >
        <button
          type="button"
          className={css({
            px: '1',
            pb: '2',
            fontSize: 'sm',
            fontWeight: 'semibold',
            color: 'accent.fg',
            borderBottom: '2px solid',
            borderColor: 'accent.default',
            bg: 'transparent',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1.5',
          })}
        >
          👤 기본 정보
        </button>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '6',
          alignItems: 'start',
        })}
      >
        {/* 왼쪽: 폼 */}
        <Card
          padding="lg"
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '5',
          })}
        >
          {/* 이메일 (읽기 전용) */}
          <div>
            <label
              htmlFor="edit-email"
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'fg.default',
                display: 'block',
                mb: '1.5',
              })}
            >
              이메일
            </label>
            <input
              id="edit-email"
              value={email}
              readOnly
              className={css({
                w: 'full',
                bg: 'bg.surfaceRaised',
                border: '1px solid',
                borderColor: 'border.default',
                borderRadius: 'lg',
                px: '4',
                py: '3',
                fontSize: 'sm',
                color: 'fg.subtle',
                outline: 'none',
                cursor: 'not-allowed',
              })}
            />
            <p className={css({ fontSize: 'xs', color: 'fg.subtle', mt: '1' })}>
              이메일은 변경할 수 없습니다.
            </p>
          </div>

          {/* 닉네임 */}
          <div>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                mb: '1.5',
              })}
            >
              <label
                htmlFor="edit-nickname"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'fg.default',
                })}
              >
                닉네임 <span className={css({ color: 'accent.fg' })}>*</span>
              </label>
              <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                2~{NICKNAME_MAX}자
              </span>
            </div>
            <input
              id="edit-nickname"
              value={nickname}
              onChange={handleChange(setNickname)}
              maxLength={NICKNAME_MAX}
              className={css({
                w: 'full',
                bg: 'bg.surface',
                border: '1px solid',
                borderColor: nicknameError
                  ? 'danger.default'
                  : 'border.default',
                borderRadius: 'lg',
                px: '4',
                py: '3',
                fontSize: 'sm',
                color: 'fg.default',
                outline: 'none',
                _focus: { borderColor: 'accent.default' },
              })}
            />
            {nicknameError ? (
              <p
                className={css({ fontSize: 'xs', color: 'danger.fg', mt: '1' })}
              >
                {nicknameError}
              </p>
            ) : (
              <p
                className={css({ fontSize: 'xs', color: 'fg.subtle', mt: '1' })}
              >
                영문, 숫자, 한글 사용 가능. 특수문자 불가.
              </p>
            )}
          </div>

          {/* 생년월일 */}
          <div>
            <label
              htmlFor="edit-birthdate"
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'fg.default',
                display: 'block',
                mb: '1.5',
              })}
            >
              생년월일
            </label>
            {/* 회원가입(STEP2)과 동일하게 type=date 달력으로 통일 (MYPAGE-FE-004). 값은 ISO YYYY-MM-DD. */}
            <input
              id="edit-birthdate"
              type="date"
              value={birthdate}
              onChange={handleChange(setBirthdate)}
              className={css({
                w: 'full',
                bg: 'bg.surface',
                border: '1px solid',
                borderColor: 'border.default',
                borderRadius: 'lg',
                px: '4',
                py: '3',
                fontSize: 'sm',
                color: 'fg.default',
                colorScheme: 'dark',
                outline: 'none',
                _focus: { borderColor: 'accent.default' },
              })}
            />
          </div>

          {/* 성별 */}
          <div>
            <label
              htmlFor="edit-gender"
              className={css({
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'fg.default',
                display: 'block',
                mb: '1.5',
              })}
            >
              성별
            </label>
            <select
              id="edit-gender"
              value={gender}
              onChange={handleChange<'남성' | '여성' | '기타' | ''>(setGender)}
              className={css({
                w: 'full',
                bg: 'bg.surface',
                border: '1px solid',
                borderColor: 'border.default',
                borderRadius: 'lg',
                px: '4',
                py: '3',
                fontSize: 'sm',
                color: 'fg.default',
                outline: 'none',
                cursor: 'pointer',
                _focus: { borderColor: 'accent.default' },
              })}
            >
              <option value="">선택 안 함</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {isDirty && (
            <p
              className={css({
                fontSize: 'xs',
                color: 'fg.subtle',
                display: 'flex',
                alignItems: 'center',
                gap: '1',
              })}
            >
              <span className={css({ color: 'accent.fg' })}>●</span>
              변경사항 저장 대기 중 · 저장하면 프로필이 업데이트 됩니다
            </p>
          )}
        </Card>

        {/* 오른쪽: 미리보기 + 저장 */}
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
          })}
        >
          {/* 미리보기 */}
          <Card padding="sm">
            <p
              className={css({
                fontSize: 'xs',
                fontWeight: 'semibold',
                color: 'fg.subtle',
                mb: '3',
              })}
            >
              👁 미리보기
            </p>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                mb: '2',
              })}
            >
              <div
                className={css({
                  w: '10',
                  h: '10',
                  borderRadius: 'full',
                  bg: 'accent.default',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  color: 'white',
                  overflow: 'hidden',
                })}
              >
                {profile.avatarUrl ? (
                  // biome-ignore lint/performance/noImgElement: 아바타는 외부 URL로 next/image 도메인 설정 불가
                  <img
                    src={profile.avatarUrl}
                    alt="preview"
                    className={css({
                      w: 'full',
                      h: 'full',
                      objectFit: 'cover',
                    })}
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'bold',
                    color: 'fg.default',
                  })}
                >
                  {nickname || profile.nickname}
                </p>
                <p className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                  @{profile.handle}
                </p>
              </div>
            </div>
            <div
              className={css({
                fontSize: 'xs',
                color: 'fg.subtle',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5',
              })}
            >
              <p>생년월일: {birthdate || '미설정'}</p>
              <p>성별: {gender || '미설정'}</p>
            </div>
          </Card>

          {/* 저장/취소 */}
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '2',
            })}
          >
            {mutation.isPending && (
              <p
                className={css({
                  fontSize: 'xs',
                  color: 'fg.subtle',
                  textAlign: 'center',
                })}
              >
                저장 중...
              </p>
            )}
            <div className={css({ display: 'flex', gap: '2' })}>
              <button
                type="button"
                onClick={() => navigate('/mypage')}
                className={css({
                  flex: 1,
                  py: '2.5',
                  fontSize: 'sm',
                  color: 'fg.default',
                  bg: 'bg.surfaceRaised',
                  border: '1px solid',
                  borderColor: 'border.emphasized',
                  borderRadius: 'lg',
                  cursor: 'pointer',
                  _hover: { borderColor: 'accent.default' },
                })}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={mutation.isPending || Boolean(nicknameError)}
                className={css({
                  flex: 2,
                  py: '2.5',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'white',
                  bg: 'accent.default',
                  border: 'none',
                  borderRadius: 'lg',
                  cursor: 'pointer',
                  _hover: { opacity: '0.9' },
                  _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                })}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
