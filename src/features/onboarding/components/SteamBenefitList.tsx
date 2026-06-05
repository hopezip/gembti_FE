import { css } from 'styled-system/css';
import { hstack, vstack } from 'styled-system/patterns';

// 스팀 연동 혜택 3열 리스트(화면1·2 하단 benefits).
// 순수 프리젠테이션: 데이터는 props(items)로만 주입받는다. 내부 fetch/navigate 금지.
// 항목 = 번호(mono accent) + 제목(body.sm bold) + 설명(fg.subtle).
// Figma 4071:551 / 4074:935 매핑. 전용 recipe 없이 css+patterns+semantic token으로 구성.

interface BenefitItem {
  /** 번호 라벨(예: '01'). mono+accent로 표기. */
  index: string;
  /** 항목 제목. body.sm bold. */
  title: string;
  /** 항목 설명. fg.subtle. */
  desc: string;
}

export interface SteamBenefitListProps {
  items: BenefitItem[];
}

export function SteamBenefitList({ items }: SteamBenefitListProps) {
  return (
    <ul
      className={hstack({
        gap: '3',
        alignItems: 'stretch',
        w: 'full',
        listStyle: 'none',
      })}
    >
      {items.map((item) => (
        <li
          key={item.index}
          className={vstack({
            gap: '1.5',
            alignItems: 'flex-start',
            flex: '1',
            bg: 'bg.surface',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 'lg',
            p: '3.5',
          })}
        >
          {/* 번호(Figma 24px·mono accent) + 아래 오렌지 밑줄(Figma 25×2 div.underline-orange) */}
          <div className={vstack({ gap: '1', alignItems: 'flex-start' })}>
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: '5xl',
                fontWeight: 'bold',
                lineHeight: 'tight',
                color: 'accent.default',
              })}
            >
              {item.index}
            </span>
            <span
              aria-hidden="true"
              className={css({
                w: '25px',
                h: '2px',
                borderRadius: 'full',
                bg: 'accent.default',
              })}
            />
          </div>
          <span
            className={css({
              textStyle: 'body.sm',
              fontWeight: 'bold',
              color: 'fg.default',
            })}
          >
            {item.title}
          </span>
          <span
            className={css({
              fontSize: 'sm',
              lineHeight: 'normal',
              color: 'fg.subtle',
            })}
          >
            {item.desc}
          </span>
        </li>
      ))}
    </ul>
  );
}
