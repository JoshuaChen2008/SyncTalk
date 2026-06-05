import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { routes } from '../../../router';
import { apiClient } from '../../../../lib/api-client';

vi.mock('stream-chat-react', () => ({
  Chat: ({ children }: { children: ReactNode }) => (
    <section aria-label="Stream chat">{children}</section>
  ),
  Channel: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  MessageComposer: () => <div>Stream message input</div>,
  MessageList: () => <div>Stream message list</div>,
  Window: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  useCreateChatClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      watch: vi.fn(async () => undefined),
    })),
  })),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderChatRoute() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/app/chat/user-2'],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function mockProtectedChat({
  channelDelay,
  channelError,
}: {
  channelDelay?: Promise<unknown>;
  channelError?: unknown;
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
      return { data: { notifications: [], unreadCount: 0 } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/chat/token') {
      return {
        data: {
          token: 'stream-token',
          user: { id: 'user-1', username: 'mei', avatar: '' },
        },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/chat/channel/user-2') {
      if (channelDelay) {
        await channelDelay;
      }

      if (channelError) {
        throw channelError;
      }

      return {
        data: {
          channelId: 'user-1-user-2',
          friend: { id: 'user-2', username: 'sam', avatar: '' },
          members: ['user-1', 'user-2'],
        },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    throw new Error(`Unexpected GET ${url}`);
  });
}

beforeEach(() => {
  vi.stubEnv('VITE_STREAM_API_KEY', 'test-stream-key');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('chat page', () => {
  it('renders loading state while the channel loads', async () => {
    mockProtectedChat({ channelDelay: new Promise(() => undefined) });

    renderChatRoute();

    expect(await screen.findByText(/loading chat/i)).toBeInTheDocument();
  });

  it('renders a Stream chat channel for a friend', async () => {
    mockProtectedChat();

    renderChatRoute();

    expect(await screen.findByRole('heading', { name: /chat with sam/i })).toBeInTheDocument();
    expect(screen.getByText(/channel user-1-user-2/i)).toBeInTheDocument();
    expect(screen.getByText(/stream message list/i)).toBeInTheDocument();
    expect(screen.getByText(/stream message input/i)).toBeInTheDocument();
  });

  it('shows forbidden state for non-friends', async () => {
    mockProtectedChat({
      channelError: { response: { status: 403, data: { error: 'Only friends can chat' } } },
    });

    renderChatRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(/only friends can chat/i);
    expect(screen.getByRole('link', { name: /back to friends/i })).toHaveAttribute('href', '/app/friends');
  });
});
