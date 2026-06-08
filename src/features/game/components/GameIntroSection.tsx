import { useState } from 'react';
import { css } from 'styled-system/css';
import { Button } from '@/components/ui/Button';

export interface GameIntroSectionProps {
  /** 요약 본문(항상 표시). */
  description: string;
  /** 전체 소개(있고 길면 토글로 펼침). 없으면 토글 없이 요약만 표시. */
  fullDescription?: string;
}

// 게임 소개 섹션 — Figma 4014:3878 기준. heading.h3 "게임 소개" + 본문.
// fullDescription이 있고 요약보다 의미 있게 길면 기본은 요약(description)만 보이고,
// "전체 소개 보기" 텍스트 버튼으로 fullDescription을 인라인 펼침(useState 토글).
// fullDescription이 없으면 토글 없이 description만 렌더한다.
// semantic token만 사용(요약 fg.subtle / 전체 본문 fg.default), 다른 도메인 import 없음.
export function GameIntroSection({
  description,
  fullDescription,
}: GameIntroSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // 전체 소개 토글 조건: fullDescription이 있고, 요약과 다르며(추가 정보 존재), 요약보다 길 때만.
  // 같거나 더 짧으면 펼칠 의미가 없으므로 토글을 숨긴다.
  const trimmedFull = fullDescription?.trim() ?? '';
  const hasFull =
    trimmedFull.length > 0 &&
    trimmedFull !== description.trim() &&
    trimmedFull.length > description.trim().length;

  return (
    <section>
      <h3
        className={css({
          textStyle: 'heading.h3', // 섹션 공통 헤딩(기존 카드 그리드와 통일)
          color: 'fg.default',
          mb: '5', // 제목→본문 간격 20px
        })}
      >
        게임 소개
      </h3>

      {/* 요약 본문 — 항상 표시. fg.subtle, 읽기 쉬운 행간. */}
      <p
        className={css({
          fontSize: 'md', // 14px 기본 본문
          lineHeight: 'relaxed',
          color: 'fg.subtle',
          whiteSpace: 'pre-line', // 백엔드 줄바꿈(\n) 보존
        })}
      >
        {description}
      </p>

      {hasFull && (
        <>
          {/* 펼쳤을 때만 전체 소개 본문 표시 — 요약과 구분되도록 fg.default. */}
          {expanded && (
            <p
              className={css({
                mt: '4', // 요약→전체 본문 간격 16px
                fontSize: 'md',
                lineHeight: 'relaxed',
                color: 'fg.default',
                whiteSpace: 'pre-line',
              })}
            >
              {fullDescription}
            </p>
          )}

          {/* 전체 소개 토글 — 공통 Button ghost(보조 액션). 펼침/접힘 상태에 따라 라벨 전환. */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
            className={css({ mt: '4' })} // 본문→버튼 간격 16px
            aria-expanded={expanded}
          >
            {expanded ? '소개 접기' : '전체 소개 보기'}
          </Button>
        </>
      )}
    </section>
  );
}
