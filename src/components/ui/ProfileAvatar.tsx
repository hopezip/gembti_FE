import { css, cx } from 'styled-system/css';

interface ProfileAvatarProps {
  size?: 'header' | 'profile';
}

const containerClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'full',
  border: '2px solid',
  borderColor: 'accent.default',
  overflow: 'hidden',
  flexShrink: 0,
  bg: 'bg.surface',
  p: '1',
});

// Panda CSS가 모든 크기 클래스를 빌드 시점에 추출할 수 있도록 정적으로 선언한다.
const sizeClass = {
  header: css({ w: '8', h: '8' }),
  profile: css({ w: 'avatarXl', h: 'avatarXl' }),
} as const;

// 헤더와 마이페이지가 동일한 에셋·테두리·내부 여백을 공유한다.
export function ProfileAvatar({ size = 'header' }: ProfileAvatarProps) {
  return (
    <span data-profile-avatar className={cx(containerClass, sizeClass[size])}>
      <img
        src="/images/profile.png"
        alt=""
        className={css({
          w: '76%',
          h: '76%',
          objectFit: 'contain',
        })}
      />
    </span>
  );
}
