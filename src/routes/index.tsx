import { createBrowserRouter } from 'react-router-dom';
import { css } from 'styled-system/css';

function HomePage() {
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
          w: 'min(720px, 100%)',
          bg: 'bg.surface',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: '3xl',
          p: '8',
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
          Bootstrap ready
        </p>
        <h1
          className={css({
            textStyle: 'heading.h1',
            color: 'fg.default',
            mb: '2',
          })}
        >
          GamBTI
        </h1>
        <p className={css({ textStyle: 'body.md', color: 'fg.muted' })}>
          게임 유저들을 위한 AI 게임 추천 서비스
        </p>
      </section>
    </main>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
]);
