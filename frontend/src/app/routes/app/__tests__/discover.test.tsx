import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../../../router';
import { apiClient } from '../../../../lib/api-client';
import { discoveryDemoUsers } from '../../../../features/discovery/demo/discovery-demo-users';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderDiscoverRoute() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/app/discover'],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function mockCurrentUser() {
  return { id: 'user-1', username: 'mei', email: 'mei@example.com' };
}

function mockCompleteProfile() {
  return {
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
  };
}

function mockDiscoveryUser(overrides = {}) {
  return {
    ...discoveryDemoUsers[0],
    ...overrides,
  };
}

function mockProtectedDiscovery({
  recommendations = [mockDiscoveryUser()],
  searchResults = [mockDiscoveryUser({ id: 'user-3', username: 'lina' })],
  recommendationError,
}: {
  recommendations?: ReturnType<typeof mockDiscoveryUser>[];
  searchResults?: ReturnType<typeof mockDiscoveryUser>[];
  recommendationError?: unknown;
} = {}) {
  return vi.spyOn(apiClient, 'get').mockImplementation(async (url, config) => {
    if (url === '/auth/me') {
      return { data: { user: mockCurrentUser() } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/profile/me') {
      return {
        data: { profile: mockCompleteProfile() },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/notifications') {
      return { data: { notifications: [], unreadCount: 0 } } as Awaited<
        ReturnType<typeof apiClient.get>
      >;
    }

    if (url === '/users/recommendations') {
      if (recommendationError) {
        throw recommendationError;
      }

      return { data: { users: recommendations } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/users/search') {
      expect(config).toMatchObject({ params: { query: 'English' } });
      return { data: { users: searchResults } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    throw new Error(`Unexpected GET ${url}`);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('discover page', () => {
  it('renders recommendation cards with match reasons and relationship status', async () => {
    mockProtectedDiscovery({ recommendations: discoveryDemoUsers.slice(0, 4) });

    renderDiscoverRoute();

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view sam profile/i })).toHaveAttribute(
      'href',
      '/app/profile/demo-user-2',
    );
    expect(screen.getByRole('link', { name: /^requests$/i })).toHaveAttribute(
      'href',
      '/app/requests',
    );
    expect(screen.getByText(/language exchange match/i)).toBeInTheDocument();
    expect(screen.getByText(/already friends/i)).toBeInTheDocument();
    expect(screen.getByText(/request sent/i)).toBeInTheDocument();
    expect(screen.getByText(/reply pending/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /review request from noa/i })).toHaveAttribute(
      'href',
      '/app/requests',
    );
  });

  it('shows an empty recommendation state', async () => {
    mockProtectedDiscovery({ recommendations: [] });

    renderDiscoverRoute();

    expect(await screen.findByText(/no partners found yet/i)).toBeInTheDocument();
  });

  it('shows recommendation loading and error states', async () => {
    mockProtectedDiscovery({
      recommendationError: {
        response: { data: { error: 'Complete your profile before discovering partners' } },
      },
    });

    renderDiscoverRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /complete your profile before discovering partners/i,
    );
  });

  it('searches users from the search input', async () => {
    const getSpy = mockProtectedDiscovery({
      recommendations: [],
      searchResults: [mockDiscoveryUser({ id: 'user-3', username: 'lina' })],
    });

    renderDiscoverRoute();

    await userEvent.type(await screen.findByLabelText(/search partners/i), 'English');

    expect(await screen.findByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledWith('/users/search', { params: { query: 'English' } });
  });

  it('renders the redesigned discover controls and handles local skip state', async () => {
    mockProtectedDiscovery({
      recommendations: [mockDiscoveryUser({ id: 'user-2', username: 'sam', relationshipStatus: 'stranger' })],
    });

    renderDiscoverRoute();

    expect(await screen.findByRole('button', { name: /best match/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /currently online/i })).toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: /skip sam/i }));
    await userEvent.click(screen.getByRole('button', { name: /hide this person/i }));

    expect(screen.queryByRole('heading', { name: /sam/i })).not.toBeInTheDocument();
    expect(window.localStorage.getItem('synctalk-discover-skipped-users')).toContain('user-2');
    expect(screen.getByRole('status')).toHaveTextContent(/hidden sam/i);

    await userEvent.click(screen.getByRole('button', { name: /undo skip/i }));

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('synctalk-discover-skipped-users')).not.toContain('user-2');
  });

  it('uses the three discover filter buttons and sort menu to filter visible cards', async () => {
    mockProtectedDiscovery({
      recommendations: [
        mockDiscoveryUser({
          id: 'demo-user-2',
          username: 'sam',
          targetLanguage: 'Japanese',
          timezone: 'Asia/Tokyo',
        }),
        mockDiscoveryUser({
          id: 'demo-user-3',
          username: 'lina',
          targetLanguage: 'English',
          timezone: 'Asia/Shanghai',
        }),
        mockDiscoveryUser({
          id: 'demo-user-5',
          username: 'mina',
          targetLanguage: 'English',
          timezone: 'Asia/Seoul',
        }),
      ],
    });

    renderDiscoverRoute();

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mina/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /learning japanese/i }));
    await userEvent.click(screen.getByRole('button', { name: /learning english/i }));

    expect(screen.queryByRole('heading', { name: /sam/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mina/i })).toBeInTheDocument();
    expect(screen.getByText(/1 filter active/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /currently online/i }));

    expect(screen.getByText(/2 filters active/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /lina/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /mina/i })).not.toBeInTheDocument();
    expect(screen.getByText(/no partners found yet/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /currently online/i }));
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mina/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /sort discovery results/i }));
    await userEvent.click(screen.getByRole('button', { name: /nearest timezone/i }));

    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(headings[0]).toMatch(/sam/i);

    await userEvent.click(screen.getByRole('button', { name: /best match/i }));

    const resetHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    expect(resetHeadings).toEqual(['sam', 'lina', 'mina']);
  });

  it('persists skipped regions and can clear skipped filters', async () => {
    mockProtectedDiscovery({
      recommendations: [
        mockDiscoveryUser({
          id: 'demo-user-2',
          username: 'sam',
          timezone: 'Asia/Tokyo',
        }),
        mockDiscoveryUser({
          id: 'demo-user-8',
          username: 'taro',
          timezone: 'Asia/Tokyo',
        }),
        mockDiscoveryUser({
          id: 'demo-user-3',
          username: 'lina',
          timezone: 'Asia/Shanghai',
        }),
      ],
    });

    renderDiscoverRoute();

    await userEvent.click(await screen.findByRole('button', { name: /skip sam/i }));
    await userEvent.click(screen.getByRole('button', { name: /hide this region/i }));

    expect(screen.queryByRole('heading', { name: /sam/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /taro/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('synctalk-discover-skipped-timezones')).toContain(
      'Asia/Tokyo',
    );
    expect(screen.getByText(/2 hidden/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /clear skipped/i }));

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /taro/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('synctalk-discover-skipped-timezones')).toBe('[]');
  });

  it('applies local filters to search results without changing the search API shape', async () => {
    const getSpy = mockProtectedDiscovery({
      recommendations: [],
      searchResults: [
        mockDiscoveryUser({
          id: 'demo-user-2',
          username: 'sam',
          targetLanguage: 'Japanese',
        }),
        mockDiscoveryUser({
          id: 'demo-user-3',
          username: 'lina',
          targetLanguage: 'English',
        }),
      ],
    });

    renderDiscoverRoute();

    await userEvent.type(await screen.findByLabelText(/search partners/i), 'English');
    await userEvent.click(await screen.findByRole('button', { name: /learning japanese/i }));
    await userEvent.click(screen.getByRole('button', { name: /learning english/i }));

    expect(screen.queryByRole('heading', { name: /sam/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledWith('/users/search', { params: { query: 'English' } });
  });

  it('sends a friend request from a stranger discovery card', async () => {
    mockProtectedDiscovery({
      recommendations: [mockDiscoveryUser({ id: 'user-2', username: 'sam', relationshipStatus: 'stranger' })],
    });
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        request: {
          id: 'request-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          status: 'pending',
          createdAt: '2026-06-01T00:00:00.000Z',
        },
      },
    } as Awaited<ReturnType<typeof apiClient.post>>);

    renderDiscoverRoute();

    await userEvent.click(await screen.findByRole('button', { name: /send request to sam/i }));

    expect(postSpy).toHaveBeenCalledWith('/friends/requests', { receiverId: 'user-2' });
    expect(await screen.findByText(/request sent to sam/i)).toBeInTheDocument();
  });
});
