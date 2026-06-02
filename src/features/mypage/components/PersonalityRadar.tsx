import { css } from 'styled-system/css';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  personality: MockUserProfile['personality'];
}

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;

function polarToXY(angle: number, r: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  };
}

function makePath(points: { x: number; y: number }[]): string {
  const segments = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`);
  return `${segments.join(' ')} Z`;
}

export function PersonalityRadar({ personality }: Props) {
  const count = personality.length;
  const angleStep = 360 / count;

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const dataPoints = personality.map((p, i) => {
    const angle = i * angleStep;
    const r = (p.value / 10) * RADIUS;
    return polarToXY(angle, r);
  });
  const dataPath = makePath(dataPoints);

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
          6대 성향 레이더
        </span>
        <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
          상위 N% 성향 →
        </span>
      </div>

      <div className={css({ display: 'flex', gap: '4', alignItems: 'center' })}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ flexShrink: 0 }}
          role="img"
          aria-label="6대 성향 레이더 차트"
        >
          <title>6대 성향 레이더 차트</title>
          {/* 배경 그리드 */}
          {gridLevels.map((level) => {
            const pts = personality.map((_, i) =>
              polarToXY(i * angleStep, RADIUS * level),
            );
            return (
              <path
                key={level}
                d={makePath(pts)}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* 축 선 */}
          {personality.map((p, i) => {
            const end = polarToXY(i * angleStep, RADIUS);
            return (
              <line
                key={`axis-${p.label}`}
                x1={CENTER}
                y1={CENTER}
                x2={end.x}
                y2={end.y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* 데이터 폴리곤 */}
          <path
            d={dataPath}
            fill="rgba(239,90,44,0.25)"
            stroke="#EF5A2C"
            strokeWidth="1.5"
          />

          {/* 데이터 점 */}
          {personality.map((p, i) => {
            const pos = polarToXY(i * angleStep, (p.value / 10) * RADIUS);
            return (
              <circle
                key={`dot-${p.label}`}
                cx={pos.x}
                cy={pos.y}
                r="3"
                fill="#EF5A2C"
              />
            );
          })}

          {/* 라벨 */}
          {personality.map((p, i) => {
            const pos = polarToXY(i * angleStep, RADIUS + 18);
            return (
              <text
                key={`label-${p.label}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.6)"
              >
                {p.label}
              </text>
            );
          })}
        </svg>

        {/* 범례 */}
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5',
            flex: 1,
          })}
        >
          {personality.map((p) => (
            <div
              key={p.label}
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                })}
              >
                <div
                  className={css({
                    w: '2',
                    h: '2',
                    borderRadius: 'full',
                    bg: 'accent.default',
                    flexShrink: 0,
                  })}
                />
                <span className={css({ fontSize: 'xs', color: 'fg.muted' })}>
                  {p.label}
                </span>
              </div>
              <span className={css({ fontSize: 'xs', color: 'fg.subtle' })}>
                {p.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
