import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STEAM_AUTH_START_URL } from '@/config/steam';
import { SteamOnboardingPage } from './SteamOnboardingPage';

// jsdom location.assign은 미구현이라 window.location을 assign 스파이가 달린 객체로 대체한다.
//   라우팅은 MemoryRouter(history 기반)라 window.location 교체에 영향받지 않는다.
const assign = vi.fn();
const originalLocation = window.location;

// STEAM-INTER-FE-008: 온보딩을 실 OpenID 위임으로 단순화했다.
//   연동하기 → window.location.assign(STEAM_AUTH_START_URL), 건너뛰기 → /survey/intro.

function renderPage(initialEntry = '/onboarding/steam?origin=steamSignup') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/onboarding/steam" element={<SteamOnboardingPage />} />
        <Route path="/survey/intro" element={<div>SURVEY INTRO</div>} />
        <Route path="/" element={<div>HOME</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  assign.mockClear();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, assign },
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

describe('SteamOnboardingPage (실 OpenID 위임)', () => {
  it('연동하기 → 백엔드 OpenID 시작 URL로 이동시킨다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      screen.getByRole('button', { name: 'Steam으로 연동하기' }),
    );

    expect(assign).toHaveBeenCalledWith(STEAM_AUTH_START_URL);
  });

  it('건너뛰기 → 설문 인트로로 이동한다', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: '건너뛰고 시작하기' }));

    expect(await screen.findByText('SURVEY INTRO')).toBeInTheDocument();
    expect(assign).not.toHaveBeenCalled();
  });
});
