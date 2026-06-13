import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
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

function renderNotificationsRoute() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/app/notifications'],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function mockNotification(overrides = {}) {
  return {
    id: 'notification-1',
    userId: 'user-1',
    type: 'friend_request',
    title: 'New friend request',
    content: 'sam sent you a friend request.',
    readAt: null,
    metadata: { href: '/app/requests' },
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function mockProtectedNotifications({
  notifications = [
    mockNotification(),
    mockNotification({
      id: 'notification-2',
      type: 'friend_accepted',
      title: 'Friend request accepted',
      content: 'lina accepted your friend request.',
      readAt: '2026-06-02T08:00:00.000Z',
      metadata: { href: '/app/friends' },
    }),
    mockNotification({
      id: 'notification-3',
      type: 'unread_message',
      title: 'New message from sam',
      content: 'sam sent you a message.',
      metadata: { href: '/app/chat/user-2' },
    }),
    mockNotification({
      id: 'notification-4',
      type: 'incoming_call',
      title: 'Incoming call from sam',
      content: 'sam is calling you.',
      metadata: { href: '/app/call/user-2' },
    }),
  ],
  unreadCount = 2,
  notificationsError,
}: {
  notifications?: ReturnType<typeof mockNotification>[];
  unreadCount?: number;
  notificationsError?: unknown;
} = {}) {
  return vi.spyOn(apiClient, 'get').mockImplementation(async (url) => {
    if (url === '/auth/me') {
      return { data: { user: { id: 'user-1', username: 'mei', email: 'mei@example.com' } } } as Awaited<
        ReturnType<typeof apiClient.get>
      >;
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
            bio: '',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/notifications') {
      if (notificationsError) {
        throw notificationsError;
      }

      return { data: { notifications, unreadCount } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    throw new Error(`Unexpected GET ${url}`);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('notifications page', () => {
  it('renders notifications with unread navigation badge and safe links', async () => {
    mockProtectedNotifications();

    renderNotificationsRoute();

    expect(await screen.findByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/notification inbox/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark visible notifications read/i })).toBeDisabled();
    expect(await screen.findByText(/sam sent you a friend request/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^notifications 2 unread$/i })).toHaveAttribute(
      'href',
      '/app/notifications',
    );
    expect(screen.getByRole('link', { name: /open new friend request/i })).toHaveAttribute(
      'href',
      '/app/requests',
    );
    expect(screen.getByText(/lina accepted your friend request/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open friend request accepted/i })).toHaveAttribute(
      'href',
      '/app/friends',
    );
    expect(screen.getByRole('link', { name: /open new message from sam/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
    expect(screen.getByRole('link', { name: /open incoming call from sam/i })).toHaveAttribute(
      'href',
      '/app/call/user-2',
    );
  });

  it('marks an unread notification as read', async () => {
    mockProtectedNotifications();
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: { notification: mockNotification({ readAt: '2026-06-02T08:00:00.000Z' }) },
    } as Awaited<ReturnType<typeof apiClient.patch>>);

    renderNotificationsRoute();

    await userEvent.click(await screen.findByRole('button', { name: /mark new friend request as read/i }));

    expect(patchSpy).toHaveBeenCalledWith('/notifications/notification-1/read');
  });

  it('shows empty and error states', async () => {
    mockProtectedNotifications({ notifications: [], unreadCount: 0 });
    renderNotificationsRoute();

    expect(await screen.findByText(/no notifications yet/i)).toBeInTheDocument();

    vi.restoreAllMocks();
    mockProtectedNotifications({
      notificationsError: { response: { data: { error: 'Could not load notifications' } } },
    });
    renderNotificationsRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load notifications/i);
  });
});
