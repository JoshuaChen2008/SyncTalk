import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../../../router';
import { apiClient } from '../../../../lib/api-client';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderAppRoute(initialEntry = '/app/settings') {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

function mockProtectedShell({ unreadCount = 3 }: { unreadCount?: number } = {}) {
  return vi.spyOn(apiClient, 'get').mockImplementation(async (url) => {
    if (url === '/auth/me') {
      return {
        data: { user: { id: 'user-1', username: 'mei', email: 'mei@example.com' } },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/profile/me') {
      return {
        data: {
          profile: {
            id: 'user-1',
            username: 'mei',
            email: 'mei@example.com',
            avatar: '',
            nativeLanguage: 'Japanese',
            targetLanguage: 'English',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/notifications') {
      return { data: { notifications: [], unreadCount } } as Awaited<
        ReturnType<typeof apiClient.get>
      >;
    }

    throw new Error(`Unexpected GET ${url}`);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('app shell and settings', () => {
  it('renders shared navigation and current user settings', async () => {
    mockProtectedShell();

    renderAppRoute();

    expect(await screen.findByRole('heading', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getAllByText(/mei@example\.com/i)).toHaveLength(2);
    expect(screen.getByRole('navigation', { name: /primary app navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^discover$/i })).toHaveAttribute(
      'href',
      '/app/discover',
    );
    expect(screen.getByRole('link', { name: /^friends$/i })).toHaveAttribute(
      'href',
      '/app/friends',
    );
    expect(screen.getByRole('link', { name: /^requests$/i })).toHaveAttribute(
      'href',
      '/app/requests',
    );
    expect(
      await screen.findByRole('link', { name: /^notifications 3 unread$/i }),
    ).toHaveAttribute('href', '/app/notifications');
    expect(screen.getByRole('link', { name: /^settings$/i })).toHaveAttribute(
      'href',
      '/app/settings',
    );
  });

  it('persists theme selection to localStorage and document data-theme', async () => {
    mockProtectedShell({ unreadCount: 0 });

    renderAppRoute();

    await userEvent.click(await screen.findByRole('button', { name: /use dark theme/i }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('synctalk-theme')).toContain('"theme":"dark"');

    await userEvent.click(screen.getByRole('button', { name: /use light theme/i }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('synctalk-theme')).toContain('"theme":"light"');
  });

  it('toggles app language from the shell and settings controls', async () => {
    mockProtectedShell({ unreadCount: 1 });

    renderAppRoute();

    await userEvent.click(
      (await screen.findAllByRole('button', { name: /switch language to chinese/i }))[0],
    );

    expect(await screen.findByRole('heading', { name: '设置' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^发现$/ })).toHaveAttribute('href', '/app/discover');
    expect(screen.getByText('语言偏好会保存在本设备，并在刷新后恢复。')).toBeInTheDocument();
    expect(window.localStorage.getItem('synctalk-locale')).toContain('"locale":"zh-CN"');

    await userEvent.click(screen.getAllByRole('button', { name: '切换到英文' })[0]);

    expect(await screen.findByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('synctalk-locale')).toContain('"locale":"en"');
  });

  it('logs out and sends the user back to login', async () => {
    mockProtectedShell({ unreadCount: 0 });
    const postSpy = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: {} } as Awaited<ReturnType<typeof apiClient.post>>);
    const router = renderAppRoute();

    await userEvent.click(await screen.findByRole('button', { name: /log out/i }));

    expect(postSpy).toHaveBeenCalledWith('/auth/logout');
    await waitFor(() => expect(router.state.location.pathname).toBe('/auth/login'));
  });
});
