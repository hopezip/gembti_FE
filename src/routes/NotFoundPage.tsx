import { Link } from 'react-router-dom';
import { css } from 'styled-system/css';

export function NotFoundPage() {
  return (
    <main
      className={css({
        minH: '100vh',
        display: 'grid',
        placeItems: 'center',
        bg: 'bg.canvas',
        p: '8',
      })}
    >
      <section
        className={css({
          w: 'min(560px, 100%)',
          bg: 'bg.surface',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: '3xl',
          p: '8',
          textAlign: 'center',
          boxShadow: 'xl',
        })}
      >
        <p
          className={css({
            fontFamily: 'mono',
            fontSize: 'xs',
            letterSpacing: 'wider',
            textTransform: 'uppercase',
            color: 'accent.fg',
            mb: '2',
          })}
        >
          404
        </p>
        <h1
          className={css({
            textStyle: 'heading.h1',
            color: 'fg.default',
            mb: '2',
          })}
        >
          페이지를 찾을 수 없습니다
        </h1>
        <p
          className={css({
            textStyle: 'body.md',
            color: 'fg.muted',
            mb: '6',
          })}
        >
          요청하신 경로가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          to="/"
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            bg: 'accent.default',
            color: 'fg.onAccent',
            textStyle: 'body.md',
            fontWeight: 'medium',
            px: '5',
            py: '2.5',
            borderRadius: 'lg',
            _hover: { bg: 'accent.hover' },
          })}
        >
          홈으로 가기
        </Link>
      </section>
    </main>
  );
}
