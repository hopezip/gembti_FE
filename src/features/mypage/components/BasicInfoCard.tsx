import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  profile: MockUserProfile;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={css({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: '2',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        _last: { borderBottom: 'none' },
      })}
    >
      <span className={css({ fontSize: 'xs', color: 'fg.subtle', minW: '16' })}>
        {label}
      </span>
      <span className={css({ fontSize: 'sm', color: 'fg.default' })}>
        {value}
      </span>
      <button
        type="button"
        className={css({
          fontSize: 'xs',
          color: 'fg.subtle',
          bg: 'transparent',
          border: 'none',
          cursor: 'pointer',
          _hover: { color: 'accent.fg' },
        })}
      >
        편집
      </button>
    </div>
  );
}

export function BasicInfoCard({ profile }: Props) {
  const genderLabel = profile.gender ?? '미설정';
  const steamLabel = profile.steamConnected ? 'Steam' : '미연동';

  return (
    <div
      className={css({
        bg: 'bg.surface',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 'xl',
        p: '4',
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '3',
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
          className={css({
            fontSize: 'xs',
            color: 'accent.fg',
            bg: 'transparent',
            border: 'none',
            cursor: 'pointer',
          })}
        >
          편집
        </button>
      </div>

      <InfoRow label="이메일" value={profile.email} />
      <InfoRow label="유저네임" value={profile.handle} />
      <InfoRow label="생년월일" value={profile.birthdate} />
      <InfoRow label="성별" value={genderLabel} />
      <InfoRow label="연동" value={steamLabel} />
    </div>
  );
}
