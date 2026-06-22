import { css } from 'styled-system/css';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/GameCard';
import { useSurveyProgressStore } from '@/features/survey/store/useSurveyProgressStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { MockUserProfile } from '@/mocks/handlers/mypage';

interface Props {
  personality: MockUserProfile['personality'];
}

const CX = 128;
const CY = 128;
const R = 82;
const LEVELS = [0.33, 0.67, 1.0];

function pt(i: number, ratio: number) {
  const angle = ((i * 60 - 90) * Math.PI) / 180;
  return {
    x: CX + R * ratio * Math.cos(angle),
    y: CY + R * ratio * Math.sin(angle),
  };
}

function hexPoints(ratio: number) {
  return Array.from({ length: 6 }, (_, i) => pt(i, ratio))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');
}

function labelProps(i: number): {
  textAnchor: 'start' | 'middle' | 'end';
  dx: number;
  dy: number;
} {
  // 0=top, 1=top-right, 2=bottom-right, 3=bottom, 4=bottom-left, 5=top-left
  if (i === 0) return { textAnchor: 'middle', dx: 0, dy: -10 };
  if (i === 1) return { textAnchor: 'start', dx: 8, dy: 4 };
  if (i === 2) return { textAnchor: 'start', dx: 8, dy: 4 };
  if (i === 3) return { textAnchor: 'middle', dx: 0, dy: 16 };
  if (i === 4) return { textAnchor: 'end', dx: -8, dy: 4 };
  return { textAnchor: 'end', dx: -8, dy: 4 };
}

// 데이터의 value는 0~10 스케일 (표시는 *10)
const ACCENT_COLOR = '#e8622a';
const GRID_COLOR = 'rgba(255,255,255,0.12)';
const AXIS_COLOR = 'rgba(255,255,255,0.08)';

export function PersonalityRadar({ personality }: Props) {
  const navigate = useNavigate();
  // 진단 완료 여부로 CTA 라벨만 분기한다(버튼 자체는 미진단자에게도 노출).
  const hasCompletedSurvey = useAuthStore(
    (state) => state.user?.hasCompletedSurvey ?? false,
  );
  // 진단/재진단 시 기존 설문 진행 상태를 초기화한다.
  const resetSurveyProgress = useSurveyProgressStore(
    (state) => state.resetProgress,
  );
  // 완료자: '취향 다시 진단' / 미진단자: '진단하러가기'.
  const ctaLabel = hasCompletedSurvey ? '취향 다시 진단' : '진단하러가기';
  const goToSurvey = () => {
    resetSurveyProgress();
    navigate('/survey/intro');
  };

  // 성향 데이터가 없으면(stats/me 미구현·미진단) 가짜 레이더 대신 빈 상태 + 진단 CTA를 노출한다.
  if (personality.length === 0) {
    return (
      <Card
        padding="md"
        className={css({ h: 'full', display: 'flex', flexDirection: 'column' })}
      >
        <span
          className={css({
            fontSize: 'sm',
            fontWeight: 'semibold',
            color: 'fg.default',
            mb: '4',
          })}
        >
          6대 성향 레이더
        </span>
        <div
          className={css({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
            textAlign: 'center',
            py: '6',
          })}
        >
          <p className={css({ fontSize: 'sm', color: 'fg.subtle' })}>
            {hasCompletedSurvey
              ? '성향 데이터를 불러올 수 없어요'
              : '아직 취향을 진단하지 않았어요'}
          </p>
          <Button variant="primary" size="sm" onClick={goToSurvey}>
            {ctaLabel}
          </Button>
        </div>
      </Card>
    );
  }

  const valuePts = personality
    .map((p, i) => pt(i, p.value / 10))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

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
          6대 성향 레이더
        </span>
        <Button variant="ghost" size="sm" onClick={goToSurvey}>
          {ctaLabel}
        </Button>
      </div>

      {/* 차트 + 범례 — PC/태블릿: 좌우 / 모바일: 상하 */}
      <div
        className={css({
          display: 'flex',
          gap: '8',
          alignItems: 'center',
          justifyContent: 'center',
          '@media (max-width: 640px)': {
            flexDirection: 'column',
            gap: '4',
          },
        })}
      >
        {/* SVG 레이더 */}
        <div
          className={css({
            flexShrink: 0,
            w: '220px',
            '@media (max-width: 640px)': {
              w: '280px',
              maxW: 'full',
            },
          })}
        >
          <svg
            viewBox={`0 0 ${CX * 2} ${CY * 2}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            role="img"
            aria-label="6대 성향 레이더 차트"
          >
            {/* 배경 격자 */}
            {LEVELS.map((level) => (
              <polygon
                key={level}
                points={hexPoints(level)}
                fill="none"
                stroke={GRID_COLOR}
                strokeWidth="1"
              />
            ))}

            {/* 축선 */}
            {personality.map((p, i) => {
              const outer = pt(i, 1.0);
              return (
                <line
                  key={p.label}
                  x1={CX}
                  y1={CY}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={AXIS_COLOR}
                  strokeWidth="1"
                />
              );
            })}

            {/* 값 폴리곤 */}
            <polygon
              points={valuePts}
              fill={ACCENT_COLOR}
              fillOpacity="0.35"
              stroke={ACCENT_COLOR}
              strokeWidth="2"
            />

            {/* 값 점 */}
            {personality.map((p, i) => {
              const { x, y } = pt(i, p.value / 10);
              return (
                <circle
                  key={p.label}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={ACCENT_COLOR}
                />
              );
            })}

            {/* 축 레이블 */}
            {personality.map((p, i) => {
              const { x, y } = pt(i, 1.18);
              const { textAnchor, dx, dy } = labelProps(i);
              return (
                <text
                  key={p.label}
                  className={css({
                    fontSize: '14px',
                    '@media (max-width: 520px)': { fontSize: '11px' },
                  })}
                  x={x + dx}
                  y={y + dy}
                  textAnchor={textAnchor}
                  fill="rgba(255,255,255,0.65)"
                >
                  {p.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* 범례 */}
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '3',
            flexShrink: 0,
            '@media (max-width: 640px)': {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, auto)',
              justifyContent: 'center',
              rowGap: '2',
              columnGap: '6',
            },
          })}
        >
          {personality.map((p) => (
            <div
              key={p.label}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: ACCENT_COLOR,
                  flexShrink: 0,
                }}
              />
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'fg.subtle',
                })}
              >
                {p.label}
              </span>
              <span
                className={css({
                  fontSize: 'xs',
                  color: 'fg.default',
                  fontWeight: 'medium',
                })}
              >
                {p.value * 10}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
