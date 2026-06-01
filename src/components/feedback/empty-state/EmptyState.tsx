import type { ReactNode } from 'react';
import { css, cx } from 'styled-system/css';
import { vstack } from 'styled-system/patterns';
import {
  EMPTY_STATE_MESSAGES,
  type EmptyStateType,
} from './empty-state.messages';

export type EmptyStateProps = {
  type: EmptyStateType;
  target?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

function getTitle(type: EmptyStateType, title: string, target?: string) {
  if (type !== 'search' || !target) return title;
  return `"${target}"에 해당하는 게임이 없어요`;
}

export function EmptyState({
  type,
  target,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const message = EMPTY_STATE_MESSAGES[type];
  const Icon = message.icon;
  const resolvedTitle = title ?? getTitle(type, message.title, target);
  const resolvedDescription = description ?? message.description;

  return (
    <div
      className={cx(
        vstack({
          w: '100%',
          minH: '220px',
          gap: '4',
          px: '6',
          py: '10',
          justifyContent: 'center',
        }),
        css({ textAlign: 'center' }),
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={css({
          color: 'fg.default',
        })}
      >
        <Icon size={48} strokeWidth={1.8} />
      </div>

      <div className={vstack({ gap: '2' })}>
        <h2 className={css({ textStyle: 'heading.h4', color: 'fg.default' })}>
          {resolvedTitle}
        </h2>

        {resolvedDescription && (
          <p
            className={css({
              maxW: '640px',
              textStyle: 'body.sm',
              color: 'fg.subtle',
            })}
          >
            {resolvedDescription}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}
