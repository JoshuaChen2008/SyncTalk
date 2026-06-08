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

function renderFriendsRoute(initialEntry = '/app/friends') {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function mockProtectedAppGet({
  friends = [],
  friendsError,
}: { friends?: unknown[]; friendsError?: unknown } = {}) {
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
            bio: '',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
          },
        },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/notifications') {
      return { data: { notifications: [], unreadCount: 0 } } as Awaited<
        ReturnType<typeof apiClient.get>
      >;
    }

    if (url === '/friends') {
      if (friendsError) {
        throw friendsError;
      }

      return { data: { friends } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    throw new Error(`Unexpected GET ${url}`);
  });
}

function mockFriend(overrides = {}) {
  return {
    friendshipId: 'friendship-1',
    id: 'user-2',
    username: 'sam',
    avatar: '',
    nativeLanguage: 'English',
    targetLanguage: 'Japanese',
    languageLevel: 'B1',
    learningGoal: 'Daily conversation',
    bio: 'Coffee chats welcome.',
    timezone: 'Asia/Tokyo',
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('friends page', () => {
  it('renders the redesigned friends page with stats, chat, call, and manage actions', async () => {
    mockProtectedAppGet({ friends: [mockFriend()] });

    renderFriendsRoute();

    expect(
      await screen.findByRole('heading', { name: /your language friends/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/online friends \/ total friends/i)).toBeInTheDocument();
    expect(await screen.findByText(/1 friend ready/i)).toBeInTheDocument();
    expect(screen.getByText(/showing 1 of 1/i)).toBeInTheDocument();
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
    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat with sam/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
    expect(screen.getByRole('link', { name: /call sam/i })).toHaveAttribute(
      'href',
      '/app/call/user-2',
    );
    await userEvent.click(screen.getByRole('button', { name: /manage sam/i }));
    expect(screen.getByRole('button', { name: /details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove sam/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /find more language partners/i })).toHaveAttribute(
      'href',
      '/app/discover',
    );
  });

  it('filters friends by search text', async () => {
    mockProtectedAppGet({
      friends: [
        mockFriend({
          id: 'user-2',
          username: 'sam',
          nativeLanguage: 'English',
          bio: 'Coffee chats welcome.',
        }),
        mockFriend({
          friendshipId: 'friendship-2',
          id: 'user-3',
          username: 'lina',
          nativeLanguage: 'Korean',
          targetLanguage: 'Spanish',
          bio: 'Indie music and weekend walks.',
          timezone: 'Europe/Berlin',
        }),
      ],
    });

    renderFriendsRoute();

    await userEvent.type(
      await screen.findByRole('searchbox', { name: /search friends/i }),
      'korean',
    );

    expect(screen.getByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /sam/i })).not.toBeInTheDocument();
    expect(screen.getByText(/showing 1 of 2/i)).toBeInTheDocument();
  });

  it('shows a filtered empty state when no friends match the search', async () => {
    mockProtectedAppGet({ friends: [mockFriend()] });

    renderFriendsRoute();

    await userEvent.type(
      await screen.findByRole('searchbox', { name: /search friends/i }),
      'mandarin',
    );

    expect(await screen.findByText(/no friends match your search/i)).toBeInTheDocument();
  });

  it('shows empty and error states', async () => {
    mockProtectedAppGet({ friends: [] });
    renderFriendsRoute();

    expect(await screen.findByText(/no friends yet/i)).toBeInTheDocument();

    vi.restoreAllMocks();
    mockProtectedAppGet({
      friendsError: { response: { data: { error: 'Could not load friends' } } },
    });
    renderFriendsRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load friends/i);
  });

  it('removes a friend from the manage menu', async () => {
    mockProtectedAppGet({ friends: [mockFriend()] });
    const deleteSpy = vi
      .spyOn(apiClient, 'delete')
      .mockResolvedValue({ data: { removed: true } } as Awaited<
        ReturnType<typeof apiClient.delete>
      >);

    renderFriendsRoute();

    await userEvent.click(await screen.findByRole('button', { name: /manage sam/i }));
    await userEvent.click(screen.getByRole('button', { name: /remove sam/i }));

    expect(deleteSpy).toHaveBeenCalledWith('/friends/user-2');
    expect(await screen.findByText(/removed sam/i)).toBeInTheDocument();
  });
});
