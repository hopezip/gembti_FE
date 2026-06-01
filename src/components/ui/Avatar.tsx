import { Avatar as ArkAvatar } from '@ark-ui/react';
import { css, cx } from 'styled-system/css';

// 공용 표시 primitive — DESIGN_SYSTEM 2.6 Avatar 명세 구현.
// Button/Tag/Chip/Input/GameCard와 달리, Field와 마찬가지로 대응 recipe가 없는 "조합 컴포넌트"다.
// styled(ark.x, recipe)가 아니라 Ark UI Avatar(Root/Image/Fallback) 구조 위에
// styled-system/css(기존 sizes 토큰 avatarXs~avatarXl + semantic token)만 얹어 스타일링한다.
// 새 토큰/새 recipe를 만들지 않는다(만들면 cross). hex/인라인 style/primitive 직접 사용 금지.
//
// thin 유지: 도메인 로직(유저 데이터 패칭 등) 없이 src/name/size/op만 소비한다.
// 이미지 로드 실패 시 Ark가 자동으로 Image→Fallback(이니셜)으로 전환한다(onError 수동 처리 불필요).
//
// 폰트 매핑 근거(티켓 비고): DESIGN_SYSTEM 2.6의 "이니셜 mono 12~14"에 1:1 대응하는
// 단일 토큰이 없어 size별로 가장 근접한 기존 fontSize 토큰으로 매핑한다 —
// xs/sm=`xs`(11), md=`sm`(12), lg/xl=`md`(13). 새 토큰은 추가하지 않는다.

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** 아바타 크기. DESIGN_SYSTEM 2.6의 24/28/32/36/48에 대응. 기본 md(32). */
  size?: AvatarSize;
  /** 이미지 URL. 미제공 또는 로드 실패 시 name 기반 이니셜 fallback으로 전환된다. */
  src?: string;
  /** 표시 대상 이름. 이미지 alt / 이니셜 파생 / 접근명(aria-label)에 사용된다. */
  name: string;
  /** 글쓴이(OP) 강조. accent 보더 + 이니셜 accent 색으로 표시한다. */
  op?: boolean;
}

// size → 컨테이너 치수(기존 sizes 토큰 avatarXs~avatarXl) 클래스 매핑.
// Panda는 정적 추출이 필요하므로 각 size를 리터럴 css() 호출로 미리 만들어 매핑한다.
const SIZE_BOX: Record<AvatarSize, string> = {
  xs: css({ width: 'avatarXs', height: 'avatarXs' }),
  sm: css({ width: 'avatarSm', height: 'avatarSm' }),
  md: css({ width: 'avatarMd', height: 'avatarMd' }),
  lg: css({ width: 'avatarLg', height: 'avatarLg' }),
  xl: css({ width: 'avatarXl', height: 'avatarXl' }),
};

// size → 이니셜 fontSize 클래스 매핑(fontSize 매핑 근거는 상단 폰트 매핑 주석 참조).
const SIZE_FONT: Record<AvatarSize, string> = {
  xs: css({ fontSize: 'xs' }),
  sm: css({ fontSize: 'xs' }),
  md: css({ fontSize: 'sm' }),
  lg: css({ fontSize: 'md' }),
  xl: css({ fontSize: 'md' }),
};

// name에서 이니셜 파생 — 공백 기준 분리해 앞 1~2글자 추출.
// 단어가 2개 이상이면 각 단어 첫 글자 2개, 1개면 그 단어의 앞 2글자(한글은 1글자만 자연스러움).
function deriveInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return [...words[0]].slice(0, 2).join('');
  }
  return (words[0][0] ?? '') + (words[1][0] ?? '');
}

export function Avatar({ size = 'md', src, name, op = false }: AvatarProps) {
  const initials = deriveInitials(name);

  const rootClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: 'full',
    bg: 'bg.surfaceRaised',
    border: '1px solid',
    // OP면 accent 보더, 아니면 기본 보더.
    borderColor: op ? 'border.accent' : 'border.default',
  });

  const imageClass = css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  });

  const fallbackClass = css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    fontFamily: 'mono',
    fontWeight: 'medium',
    lineHeight: 'none',
    userSelect: 'none',
    // OP면 accent 색 이니셜, 아니면 기본 텍스트 색.
    color: op ? 'accent.default' : 'fg.default',
  });

  return (
    <ArkAvatar.Root
      // 접근명은 항상 컨테이너에 둔다(이미지/이니셜 어느 쪽이든 접근명 유지).
      aria-label={name}
      className={cx(rootClass, SIZE_BOX[size])}
    >
      {/* 이니셜 fallback — 이미지 미제공/로드 실패 시 Ark가 자동 표시.
          장식 텍스트이므로 aria-hidden(접근명은 Root의 aria-label). */}
      <ArkAvatar.Fallback
        aria-hidden="true"
        className={cx(fallbackClass, SIZE_FONT[size])}
      >
        {initials}
      </ArkAvatar.Fallback>
      {/* src가 있을 때만 이미지 렌더. alt={name}로 접근명을 추가 보강한다. */}
      {src && <ArkAvatar.Image src={src} alt={name} className={imageClass} />}
    </ArkAvatar.Root>
  );
}
