import { css } from 'styled-system/css';

// 권한 유형 (routing.md 정의서 기준)
export type RouteAccess = 'Public' | 'Public only' | 'Auth' | 'Technical';

interface PlaceholderPageProps {
  // 화면명 (예: 로그인)
  title: string;
  // 라우트 경로 (예: /login)
  route: string;
  // 접근 권한 표시
  access: RouteAccess;
}

// 스캐폴딩용 공통 플레이스홀더 페이지.
// 실제 화면 구현 전까지 23개 라우트가 이 컴포넌트 1개를 공유한다(라우트별 빈 파일 금지).
// 스타일은 NotFoundPage/HomePage 패턴(styled-system css() + semantic token, 다크모드)을 따른다.
export function PlaceholderPage({
  title,
  route,
  access,
}: PlaceholderPageProps) {
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
          Placeholder
        </p>
        <h1
          className={css({
            textStyle: 'heading.h1',
            color: 'fg.default',
            mb: '4',
          })}
        >
          {title}
        </h1>
        <dl
          className={css({
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '2',
            justifyContent: 'center',
            textAlign: 'left',
            w: 'fit-content',
            mx: 'auto',
          })}
        >
          <dt className={css({ textStyle: 'body.md', color: 'fg.subtle' })}>
            Route
          </dt>
          <dd
            className={css({
              textStyle: 'body.md',
              fontFamily: 'mono',
              color: 'fg.muted',
            })}
          >
            {route}
          </dd>
          <dt className={css({ textStyle: 'body.md', color: 'fg.subtle' })}>
            Access
          </dt>
          <dd className={css({ textStyle: 'body.md', color: 'fg.muted' })}>
            {access}
          </dd>
        </dl>
      </section>
    </main>
  );
}
