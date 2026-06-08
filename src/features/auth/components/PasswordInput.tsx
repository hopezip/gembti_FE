import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useId,
  useState,
} from 'react';
import { css } from 'styled-system/css';
import { Input, type InputProps } from '@/components/ui/Input';

// 비밀번호 입력 + 👁 표시/숨김 토글 조합(auth feature 로컬).
// 공유 Input(primitive)을 무편집으로 재사용하기 위한 래퍼다.
//
// 핵심: Field가 children에 cloneElement로 id/aria-required/aria-invalid/aria-describedby를
//   주입하므로, 비밀번호 Field의 children은 Input이 아니라 PasswordInput을 넣고
//   PasswordInput이 ref와 그 주입 props(...rest)를 안쪽 Input으로 그대로 forward한다.
//   토글은 안쪽 Input의 `type`만 password↔text로 바꾼다(register/aria/ref는 불변).
// semantic token만 사용. primitive(gray.900)/hex/인라인 style 금지.

// 네이티브 input 속성(autoComplete/placeholder/disabled/register가 주입하는 name/onChange 등)과
// Input recipe variant(InputProps)를 모두 받는다.
// type/className은 내부에서 토글·여백 제어로 쓰므로 외부에서 받지 않는다.
type PasswordInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'className'
> &
  InputProps;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);
    // 토글 버튼이 입력을 가리키도록 안정적인 id(접근성 보조). Field 주입 id와 무관.
    const toggleId = useId();

    return (
      <div className={css({ position: 'relative', display: 'flex' })}>
        <Input
          // Field가 주입한 id/aria-* + register(name/onChange/ref)를 안쪽 Input으로 forward.
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          // 👁 버튼이 입력 텍스트를 가리지 않도록 우측 패딩 확보.
          className={css({ pr: '10' })}
        />
        <button
          id={toggleId}
          type="button"
          aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className={css({
            position: 'absolute',
            top: '50%',
            right: '2',
            transform: 'translateY(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '7',
            h: '7',
            borderRadius: 'md',
            color: 'fg.subtle',
            cursor: 'pointer',
            _hover: { color: 'fg.default', bg: 'bg.surfaceRaised' },
            _focusVisible: {
              outline: '2px solid',
              outlineColor: 'border.accent',
              outlineOffset: '1px',
            },
          })}
        >
          {/* 의미 전달은 버튼 aria-label이 담당, 아이콘은 장식(alt="") */}
          <img
            src={visible ? '/icons/eye-off.png' : '/icons/eye.png'}
            alt=""
            aria-hidden="true"
            className={css({ w: '5', h: '5' })}
          />
        </button>
      </div>
    );
  },
);
