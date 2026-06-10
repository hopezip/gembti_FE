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
  // 설문을 완료한 사용자에게만 '취향 다시 진단' CTA를 노출한다.
  const hasCompletedSurvey = useAuthStore(
    (state) => state.user?.hasCompletedSurvey ?? false,
  );
  // 재진단 시 기존 설문 진행 상태를 초기화한다.
  const resetSurveyProgress = useSurveyProgressStore(
    (state) => state.resetProgress,
  );
  // 미응답 문항이 남아있는 경우 설문 이어하기 상태로 판단한다.
  const hasSkippedQuestions = useSurveyProgressStore(
    (state) => state.skippedQuestionIds.length > 0,
  );
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
        {hasCompletedSurvey && (
          // 미응답 문항이 남아있는 경우
          // 기존 응답값을 유지한 채 설문을 이어서 진행한다.
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (hasSkippedQuestions) {
                navigate('/survey');
                return;
              }

              resetSurveyProgress();
              navigate('/survey/intro');
            }}
          >
            {hasSkippedQuestions ? '설문 이어하기' : '취향 다시 진단'}
          </Button>
        )}
      </div>

      {/* 차트 + 범례 */}
      <div className={css({ display: 'flex', gap: '4', alignItems: 'center' })}>
        {/* SVG 레이더 */}
        <svg
          width={CX * 2}
          height={CY * 2}
          viewBox={`0 0 ${CX * 2} ${CY * 2}`}
          style={{ flexShrink: 0 }}
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
              <circle key={p.label} cx={x} cy={y} r="3.5" fill={ACCENT_COLOR} />
            );
          })}

          {/* 축 레이블 */}
          {personality.map((p, i) => {
            const { x, y } = pt(i, 1.18);
            const { textAnchor, dx, dy } = labelProps(i);
            return (
              <text
                key={p.label}
                x={x + dx}
                y={y + dy}
                textAnchor={textAnchor}
                fontSize="11"
                fill="rgba(255,255,255,0.65)"
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
                className={css({ fontSize: 'xs', color: 'fg.subtle', flex: 1 })}
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
