import { css } from 'styled-system/css';

// 설문 결과의 6대 성향 점수. API 연결 전 mock도 이 형태를 따른다.
export interface TraitScore {
  label: string;
  score: number;
}

interface TraitRadarChartProps {
  scores: TraitScore[];
}

// SVG 내부 좌표계. 화면 크기는 CSS maxW로 조절하고, 도형 계산은 이 고정 좌표를 쓴다.
const CX = 160;
const CY = 170;
const R = 104;
const LEVELS = [0.25, 0.5, 0.75, 1];

function point(index: number, ratio: number) {
  const angle = ((index * 60 - 90) * Math.PI) / 180;
  return {
    x: CX + R * ratio * Math.cos(angle),
    y: CY + R * ratio * Math.sin(angle),
  };
}

function hexPoints(ratio: number) {
  return Array.from({ length: 6 }, (_, index) => point(index, ratio))
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');
}

// 축 위치별 라벨 오프셋. 차트 선과 텍스트가 겹치지 않게 한다.
function labelOffset(index: number) {
  if (index === 0) return { dx: 0, dy: -36, anchor: 'middle' as const };
  if (index === 1) return { dx: 20, dy: -2, anchor: 'start' as const };
  if (index === 2) return { dx: 20, dy: 12, anchor: 'start' as const };
  if (index === 3) return { dx: 0, dy: 48, anchor: 'middle' as const };
  if (index === 4) return { dx: -20, dy: 12, anchor: 'end' as const };
  return { dx: -20, dy: -2, anchor: 'end' as const };
}

// 설문 결과 화면 전용 레이더 차트. 마이페이지 레이더와 분리해 남의 작업을 건드리지 않는다.
export function TraitRadarChart({ scores }: TraitRadarChartProps) {
  const valuePoints = scores
    .map((score, index) => point(index, score.score / 100))
    .map(({ x, y }) => `${x},${y}`)
    .join(' ');

  return (
    <section className={css({ minW: 0 })} aria-label="6대 성향 레이더">
      <p
        className={css({
          m: '0',
          mb: '3',
          color: 'fg.subtle',
          fontSize: 'clamp(token(fontSizes.lg), 1.8vw, token(fontSizes.2xl))',
          fontWeight: 'bold',
        })}
      >
        성향 분석 결과
      </p>

      <svg
        className={css({
          display: 'block',
          w: 'clamp(260px, 32vw, 360px)',
          maxW: '100%',
          mx: 'auto',
          h: 'auto',
          overflow: 'visible',
        })}
        viewBox="0 0 320 360"
        role="img"
        aria-label="탐험, 액션, 도전, 서사, 협동, 전략 점수 레이더 차트"
      >
        {/* 배경 격자와 축선은 semantic border token만 사용한다. */}
        {LEVELS.map((level) => (
          <polygon
            key={level}
            points={hexPoints(level)}
            fill="none"
            className={css({ stroke: 'border.emphasized', opacity: '0.9' })}
            strokeWidth="1"
          />
        ))}
        {scores.map((score, index) => {
          const outer = point(index, 1);
          return (
            <line
              key={score.label}
              x1={CX}
              y1={CY}
              x2={outer.x}
              y2={outer.y}
              className={css({ stroke: 'border.emphasized', opacity: '0.72' })}
              strokeWidth="1"
            />
          );
        })}

        {/* 실제 점수 영역과 꼭짓점 마커. */}
        <polygon
          points={valuePoints}
          className={css({ fill: 'accent.default', stroke: 'accent.default' })}
          fillOpacity="0.62"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {scores.map((score, index) => {
          const { x, y } = point(index, score.score / 100);
          return (
            <circle
              key={score.label}
              cx={x}
              cy={y}
              r="5"
              className={css({ fill: 'accent.default' })}
            />
          );
        })}

        {/* 축 라벨과 점수. 점수는 라벨 아래 주황색으로 표시한다. */}
        {scores.map((score, index) => {
          const { x, y } = point(index, 1);
          const { dx, dy, anchor } = labelOffset(index);
          return (
            <g key={score.label}>
              <text
                x={x + dx}
                y={y + dy}
                textAnchor={anchor}
                className={css({
                  fill: 'fg.default',
                  fontSize: 'sm',
                  fontWeight: 'bold',
                })}
              >
                {score.label}
              </text>
              <text
                x={x + dx}
                y={y + dy + 22}
                textAnchor={anchor}
                className={css({
                  fill: 'accent.default',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                })}
              >
                {score.score}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
