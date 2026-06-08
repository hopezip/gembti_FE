import { css, cx } from 'styled-system/css';

const accentGlow =
  'color-mix(in srgb, token(colors.accent.default) 56%, transparent)';
const mutedLine =
  'color-mix(in srgb, token(colors.fg.subtle) 34%, transparent)';
const hexagon = 'polygon(50% 0, 94% 24%, 94% 76%, 50% 100%, 6% 76%, 6% 24%)';

const scaleLabels = ['전혀 아니다', '', '보통이다', '', '매우 그렇다'];
const scaleValues = [1, 2, 3, 4, 5] as const;

interface SurveyAnswerScaleProps {
  selectedValue: number | null;
  onSelect: (value: number) => void;
}

export function SurveyAnswerScale({
  selectedValue,
  onSelect,
}: SurveyAnswerScaleProps) {
  return (
    // 1~5 리커트 선택지. 선택된 값만 주황색 프레임으로 강조한다.
    <fieldset
      className={css({
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gap: 'clamp(6px, 1.8vw, 18px)',
        w: 'clamp(320px, 74vw, 620px)',
        maxW: 'full',
        m: '0',
        pb: { base: '4', md: '5', lg: '30px' },
        px: '0',
        border: '0',
      })}
      aria-labelledby="survey-question"
    >
      {scaleValues.map((value) => {
        const selected = selectedValue === value;
        return (
          <div
            className={css({
              display: 'grid',
              justifyItems: 'center',
              gap: '2',
              minW: '0',
            })}
            key={value}
          >
            <button
              type="button"
              className={cx(
                css({
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                  w: 'clamp(58px, 10vw, 88px)',
                  h: 'clamp(58px, 10vw, 88px)',
                  p: '1px',
                  border: '0',
                  cursor: 'pointer',
                  color: 'fg.muted',
                  bg: mutedLine,
                  clipPath: hexagon,
                  transitionDuration: 'base',
                  transitionProperty: 'transform, background, color, filter',
                  _hover: {
                    transform: 'translateY(-2px)',
                  },
                  _focusVisible: {
                    outline: 'none',
                    boxShadow: 'focusRing',
                  },
                }),
                selected &&
                  css({
                    color: 'fg.onAccent',
                    bg: 'accent.default',
                    filter: `drop-shadow(0 0 12px ${accentGlow})`,
                    transform: 'translateY(-4px) scale(1.05)',
                  }),
              )}
              aria-pressed={selected}
              aria-label={`${value}점 ${scaleLabels[value - 1] || ''}`.trim()}
              onClick={() => onSelect(value)}
            >
              <span
                className={cx(
                  css({
                    display: 'grid',
                    placeItems: 'center',
                    w: 'full',
                    h: 'full',
                    bg: 'bg.surface',
                    clipPath: hexagon,
                  }),
                  selected &&
                    css({
                      bg: 'accent.default',
                    }),
                )}
              >
                <span
                  className={css({
                    position: 'relative',
                    zIndex: 'raised',
                    fontFamily: 'mono',
                    fontSize: { base: '2xl', md: '4xl' },
                    fontWeight: 'bold',
                    lineHeight: 'none',
                  })}
                >
                  {value}
                </span>
              </span>
            </button>
            <span
              className={cx(
                css({
                  minH: '24px',
                  color: 'fg.subtle',
                  fontSize: { base: '2xs', md: 'sm' },
                  lineHeight: 'snug',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  px: '1',
                }),
                selected &&
                  css({
                    color: 'accent.fg',
                    fontWeight: 'semibold',
                  }),
              )}
            >
              {scaleLabels[value - 1]}
            </span>
          </div>
        );
      })}
    </fieldset>
  );
}
