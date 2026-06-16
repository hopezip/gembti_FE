import { type CSSProperties, useMemo } from 'react';
import { surveyEmberStyles } from './surveyEmber.styles';

// SURVEY-FE-004 · 설문 배경 불씨(ember) 데코 레이어.
// 하단 hearth glow + 위로 떠오르는 불씨 65개. 색은 token 기반(surveyEmber.styles.ts), 움직임은 keyframes.
// 랜덤 파라미터는 마운트 시 1회만 계산(useMemo)하고 CSS 변수로 주입한다 — 리렌더마다 재계산하지 않는다.

const EMBER_COUNT = 65;
const SPEED = 2.5; // 상승 속도 배율 (animation-duration = dur / SPEED)
const SIZE_MUL = 1.7; // 불씨 지름 배율

const random = (min: number, max: number) => min + Math.random() * (max - min);

interface EmberParam {
  left: number; // %
  size: number; // px
  scale: number;
  opacity: number;
  swayA: number; // px
  swayB: number; // px
  duration: number; // s (고유 길이, 전역 속도로 나뉜다)
  delay: number; // s (음수 — 시작 시점 분산)
}

// CSS 변수 주입을 위한 확장 타입.
type EmberVars = CSSProperties & Record<`--ember-${string}`, string | number>;

export function SurveyEmberBackground() {
  const embers = useMemo<EmberParam[]>(
    () =>
      Array.from({ length: EMBER_COUNT }, () => {
        const duration = random(4, 9);
        return {
          left: random(0, 100),
          size: random(2, 7) * SIZE_MUL,
          scale: random(0.7, 1.6),
          opacity: random(0.6, 1),
          swayA: random(-60, 60),
          swayB: random(-90, 90),
          duration,
          delay: -random(0, duration),
        };
      }),
    [],
  );

  const layerStyle = { '--ember-speed': SPEED } as EmberVars;

  return (
    <div className={surveyEmberStyles.layer} style={layerStyle} aria-hidden>
      <div className={surveyEmberStyles.hearth} />
      {embers.map((ember, index) => {
        const style: EmberVars = {
          left: `${ember.left}%`,
          animationDelay: `${ember.delay}s`,
          '--ember-sz': `${ember.size}px`,
          '--ember-sc': ember.scale,
          '--ember-op': ember.opacity,
          '--ember-sway-a': `${ember.swayA}px`,
          '--ember-sway-b': `${ember.swayB}px`,
          '--ember-dur': `${ember.duration}s`,
        };
        return (
          // 위치/랜덤 파라미터만 인라인 변수로 주입 (색·움직임은 token/keyframes).
          // biome-ignore lint/suspicious/noArrayIndexKey: 정적 데코 요소, 순서 불변.
          <span key={index} className={surveyEmberStyles.ember} style={style} />
        );
      })}
    </div>
  );
}
