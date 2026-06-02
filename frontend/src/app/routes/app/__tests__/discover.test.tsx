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
});

describe('discover page', () => {
  it('renders recommendation cards with match reasons and relationship status', async () => {
    mockProtectedDiscovery({ recommendations: discoveryDemoUsers.slice(0, 4) });

    renderDiscoverRoute();

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /friend requests/i })).toHaveAttribute(
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
