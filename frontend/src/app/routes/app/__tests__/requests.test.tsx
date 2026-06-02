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

function renderRequestsRoute() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/app/requests'],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function mockUser(overrides = {}) {
  return {
    id: 'user-2',
    username: 'sam',
    avatar: '',
    nativeLanguage: 'English',
    targetLanguage: 'Japanese',
    languageLevel: 'B1',
    learningGoal: 'Daily conversation',
    bio: 'Coffee chats welcome.',
    timezone: 'Asia/Tokyo',
    ...overrides,
  };
}

function mockRequest(overrides = {}) {
  return {
    id: 'request-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    status: 'pending',
    createdAt: '2026-06-01T00:00:00.000Z',
    user: mockUser(),
    ...overrides,
  };
}

function mockProtectedRequests({
  receivedRequests = [mockRequest()],
  sentRequests = [mockRequest({ id: 'request-2', senderId: 'user-1', receiverId: 'user-3', user: mockUser({ id: 'user-3', username: 'lina' }) })],
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

    if (url === '/friends/requests') {
      return { data: { receivedRequests, sentRequests } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    throw new Error(`Unexpected GET ${url}`);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requests page', () => {
  it('renders received and sent friend requests', async () => {
    mockProtectedRequests();

    renderRequestsRoute();

    expect(await screen.findByRole('heading', { name: /friend requests/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^discover$/i })).toHaveAttribute(
      'href',
      '/app/discover',
    );
    expect(screen.getByRole('link', { name: /^friends$/i })).toHaveAttribute('href', '/app/friends');
    expect(screen.getByRole('link', { name: /^requests$/i })).toHaveAttribute(
      'href',
      '/app/requests',
    );
    expect(screen.getByRole('heading', { name: /lina/i })).toBeInTheDocument();
    expect(screen.getByText(/sent requests/i)).toBeInTheDocument();
  });

  it('accepts and rejects received friend requests', async () => {
    mockProtectedRequests();
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: { request: mockRequest({ status: 'accepted' }) },
    } as Awaited<ReturnType<typeof apiClient.patch>>);

    renderRequestsRoute();

    await userEvent.click(await screen.findByRole('button', { name: /accept sam/i }));
    await userEvent.click(screen.getByRole('button', { name: /reject sam/i }));

    expect(patchSpy).toHaveBeenNthCalledWith(1, '/friends/requests/request-1', { action: 'accept' });
    expect(patchSpy).toHaveBeenNthCalledWith(2, '/friends/requests/request-1', { action: 'reject' });
  });
});
