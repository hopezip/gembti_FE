import type { ComponentProps } from 'react';
import { Search } from 'lucide-react';
import { css, cx } from 'styled-system/css';
import { Input } from './Input';

type SearchInputProps = ComponentProps<typeof Input> & {
  containerClassName?: string;
};

// 검색 입력의 아이콘·내부 여백을 한곳에서 관리한다.
// 검색 상태와 제출 방식은 각 소비자가 value/onChange/form으로 소유한다.
export function SearchInput({
  className,
  containerClassName,
  size = 'md',
  ...props
}: SearchInputProps) {
  const isLarge = size === 'lg';

  return (
    <div
      className={cx(
        css({ position: 'relative', w: 'full' }),
        containerClassName,
      )}
    >
      <Search
        size={isLarge ? 16 : 14}
        aria-hidden="true"
        className={css({
          position: 'absolute',
          left: isLarge ? '4' : '3',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: '1',
          color: 'fg.subtle',
          pointerEvents: 'none',
        })}
      />
      <Input
        {...props}
        type="search"
        size={size}
        className={cx(css({ pl: isLarge ? '12' : '9' }), className)}
      />
    </div>
  );
}
