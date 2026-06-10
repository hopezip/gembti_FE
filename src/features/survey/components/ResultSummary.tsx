import { ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';
import { button } from 'styled-system/recipes';
import { TraitRadarChart, type TraitScore } from './TraitRadarChart';

interface ResultSummaryProps {
  archetype: string;
  description: string;
  scores: TraitScore[];
  tags?: string[];
}

// 설문 결과 상단: 좌측 레이더와 우측 대표 유형 설명을 조립한다.
export function ResultSummary({
  archetype,
  description,
  scores,
  tags = [],
}: ResultSummaryProps) {
  return (
    <section
      className={css({
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(min(100%, clamp(320px, 42vw, 460px)), 1fr))',
        columnGap: 'clamp(token(spacing.6), 4vw, token(spacing.12))',
        rowGap: 'clamp(token(spacing.8), 5vw, token(spacing.12))',
        alignItems: 'center',
      })}
      aria-labelledby="survey-result-title"
    >
      <TraitRadarChart scores={scores} />

      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 'clamp(token(spacing.5), 2vw, token(spacing.6))',
        })}
      >
        <p
          className={css({
            m: '0',
            color: 'accent.default',
            fontFamily: 'mono',
            fontSize: 'clamp(token(fontSizes.xs), 1vw, token(fontSizes.sm))',
            fontWeight: 'bold',
            letterSpacing: '1.2px',
          })}
        >
          YOUR PLAYER ARCHETYPE
        </p>

        <h1
          className={css({
            m: '0',
            color: 'fg.default',
            fontSize:
              'clamp(token(fontSizes.6xl), 3.6vw, token(fontSizes.8xl))',
            fontWeight: 'bold',
            lineHeight: 'tight',
            letterSpacing: 'normal',
          })}
          id="survey-result-title"
        >
          당신은{' '}
          <span className={css({ color: 'accent.default' })}>{archetype}</span>
          <br />
          플레이어입니다
        </h1>

        <p
          className={css({
            m: '0',
            maxW: '640px',
            color: 'fg.subtle',
            fontSize: 'clamp(token(fontSizes.lg), 1.35vw, token(fontSizes.xl))',
            lineHeight: 'relaxed',
          })}
        >
          {description}
        </p>

        {tags.length > 0 && (
          <ul
            className={css({
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(token(spacing.2), 1vw, token(spacing.3))',
              p: '0',
              m: '0',
              listStyle: 'none',
            })}
            aria-label="대표 성향 태그"
          >
            {tags.map((tag) => (
              <li
                className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  minH: '9',
                  px: '4',
                  border: '1px solid',
                  borderColor: 'accent.default',
                  borderRadius: 'full',
                  color: 'accent.default',
                  bg: 'accent.soft',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                })}
                key={tag}
              >
                # {tag}
              </li>
            ))}
          </ul>
        )}

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '4',
            w: 'full',
            maxW: '540px',
          })}
        >
          <Link
            to="/recommendations"
            className={button({ variant: 'primary', size: 'lg' })}
          >
            추천 더 보러 가기
            <ArrowRight className={css({ w: '4', h: '4' })} aria-hidden />
          </Link>
          <Link to="/" className={button({ variant: 'secondary', size: 'lg' })}>
            <Home className={css({ w: '4', h: '4' })} aria-hidden />
            메인으로
          </Link>
        </div>
      </div>
    </section>
  );
}
