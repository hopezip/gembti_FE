import { type ReactElement, cloneElement, isValidElement } from 'react';
import { css } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';

// 공용 폼 래퍼 primitive — DESIGN_SYSTEM 2.15 Field(Form Wrapper) 명세 구현.
// 앞선 5개 primitive(Button/Tag/Chip/Input/GameCard)와 달리 대응 recipe가 없는 "조합 컴포넌트"다.
// styled(ark.x, recipe)가 아니라 styled-system/patterns(vstack) + css(기존 textStyles 매핑 + semantic token)로
// label row → children 슬롯 → help → error를 조합한다. 새 토큰/새 textStyle을 만들지 않는다(만들면 cross).
//
// thin 유지: 폼 라이브러리(RHF/Zod)에 결합하지 않는다. 검증/`error` 문자열 생성은 소비 화면 책임이며
// Field는 label/필수표시/hint/help/error 표시와 a11y 연결(htmlFor/aria-*)만 담당한다.
//
// 폰트 매핑 근거(티켓 비고): DESIGN_SYSTEM 2.15의 "mono 11.5", "field-error 12"에 1:1 대응하는
// 토큰이 없어 가장 근접한 기존 토큰으로 매핑한다 — label=`md`(13)/`semibold`(600),
// hint·help=mono `xs`(11), error=mono `sm`(12). 새 토큰은 추가하지 않는다.

export interface FieldProps {
  /** label 텍스트. 입력과 `htmlFor`/`id`로 연결된다. */
  label: string;
  /** 입력 요소의 id. label `htmlFor`↔입력 id 연결 및 help/error id 파생에 사용한다. */
  id: string;
  /** 필수 여부. 라벨에 accent `*` 표시 + 입력에 `aria-required` 주입. */
  required?: boolean;
  /** label row 우측에 표시하는 보조 힌트(mono). */
  hint?: string;
  /** 입력 아래 도움말(mono). error가 있으면 표시되지 않는다. */
  help?: string;
  /** 오류 메시지. 존재 시 help 대신 표시 + 입력에 `aria-invalid`/`aria-describedby` 주입. */
  error?: string;
  /** 임의의 입력 요소(예: Input). id/aria-* 가 cloneElement로 주입된다. */
  children: ReactElement;
}

export function Field({
  label,
  id,
  required = false,
  hint,
  help,
  error,
  children,
}: FieldProps) {
  const hasError = Boolean(error);
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  // error가 있으면 errorId를, error 없이 help만 있으면 helpId를 aria-describedby로 연결한다.
  let describedBy: string | undefined;
  if (hasError) {
    describedBy = errorId;
  } else if (help) {
    describedBy = helpId;
  }

  // children 입력에 a11y 속성을 주입한다(소비자는 입력 id만 Field에 넘기면 됨).
  const input = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        'aria-required': required || undefined,
        'aria-invalid': hasError || undefined,
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={vstack({ gap: '1.5', alignItems: 'stretch' })}>
      {/* ① label row — 라벨(13/600) + 필수표시(accent) + 우측 hint(mono) */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '2',
        })}
      >
        <label
          htmlFor={id}
          className={css({
            fontSize: 'md',
            fontWeight: 'semibold',
            color: 'fg.default',
          })}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className={css({ color: 'accent.default', ml: '1' })}
            >
              *
            </span>
          )}
        </label>
        {hint && (
          <span
            className={css({
              fontFamily: 'mono',
              fontSize: 'xs',
              color: 'fg.subtle',
              flexShrink: 0,
            })}
          >
            {hint}
          </span>
        )}
      </div>

      {/* ② 입력 children 슬롯 */}
      {input}

      {/* ③ field-help — error가 없을 때만 표시(mono / fg.subtle) */}
      {!hasError && help && (
        <p
          id={helpId}
          className={css({
            fontFamily: 'mono',
            fontSize: 'xs',
            color: 'fg.subtle',
          })}
        >
          {help}
        </p>
      )}

      {/* ④ field-error — 오류 시에만 표시(mono / danger.default) */}
      {hasError && (
        <p
          id={errorId}
          className={css({
            fontFamily: 'mono',
            fontSize: 'sm',
            color: 'danger.default',
          })}
        >
          {error}
        </p>
      )}
    </div>
  );
}
