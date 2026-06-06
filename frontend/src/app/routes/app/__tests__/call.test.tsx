import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { routes } from '../../../router';
import { apiClient } from '../../../../lib/api-client';

const { createMockVideoClient, mockCalls, mockVideoClients } = vi.hoisted(() => {
  const mockCalls: Array<{
    join: ReturnType<typeof vi.fn>;
    leave: ReturnType<typeof vi.fn>;
  }> = [];
  const mockVideoClients: Array<{
    call: ReturnType<typeof vi.fn>;
    disconnectUser: ReturnType<typeof vi.fn>;
  }> = [];

  return {
    mockCalls,
    mockVideoClients,
    createMockVideoClient: vi.fn(() => {
      const mockCall = {
        join: vi.fn(async () => undefined),
        leave: vi.fn(async () => undefined),
      };
      const mockVideoClient = {
        call: vi.fn(() => mockCall),
        disconnectUser: vi.fn(async () => undefined),
      };

      mockCalls.push(mockCall);
      mockVideoClients.push(mockVideoClient);

      return mockVideoClient;
    }),
  };
});

vi.mock('@stream-io/video-client', () => ({
  StreamVideoClient: createMockVideoClient,
}));

vi.mock('@stream-io/video-react-sdk', () => ({
  CallControls: ({ onLeave }: { onLeave?: () => void }) => (
    <button type="button" onClick={onLeave}>
      Leave call
    </button>
  ),
  SpeakerLayout: () => <div>Stream speaker layout</div>,
  StreamCall: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  StreamTheme: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  StreamVideo: ({ children }: { children: ReactNode }) => (
    <section aria-label="Stream video">{children}</section>
  ),
  StreamVideoClient: createMockVideoClient,
  useCallStateHooks: () => ({
    useParticipants: () => [{ userId: 'user-1' }, { userId: 'user-2' }],
  }),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderCallRoute() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/app/call/user-2'],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function mockProtectedCall({
  sessionDelay,
  sessionError,
}: {
  sessionDelay?: Promise<unknown>;
  sessionError?: unknown;
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

    if (url === '/friends') {
      return { data: { friends: [] } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/call/token') {
      return {
        data: {
          token: 'video-token',
          user: { id: 'user-1', username: 'mei', avatar: '' },
        },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/call/session/user-2') {
      if (sessionDelay) {
        await sessionDelay;
      }

      if (sessionError) {
        throw sessionError;
      }

      return {
        data: {
          callId: 'user-1-user-2',
          callType: 'default',
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
  mockCalls.length = 0;
  mockVideoClients.length = 0;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('call page', () => {
  it('renders loading state while the call session loads', async () => {
    mockProtectedCall({ sessionDelay: new Promise(() => undefined) });

    renderCallRoute();

    expect(await screen.findByText(/loading call/i)).toBeInTheDocument();
  });

  it('renders a Stream video call for a friend', async () => {
    mockProtectedCall();

    renderCallRoute();

    expect(await screen.findByRole('heading', { name: /call with sam/i })).toBeInTheDocument();
    expect(screen.getByText(/call user-1-user-2/i)).toBeInTheDocument();
    expect(screen.getByText(/live with 1 partner/i)).toBeInTheDocument();
    expect(screen.getByText(/stream speaker layout/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /leave call/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to chat/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
  });

  it('leaves the active call and disconnects the video client from the Stream controls', async () => {
    mockProtectedCall();

    renderCallRoute();

    fireEvent.click(await screen.findByRole('button', { name: /leave call/i }));

    await waitFor(() => {
      expect(mockCalls.at(-1)?.leave).toHaveBeenCalled();
      expect(mockVideoClients.at(-1)?.disconnectUser).toHaveBeenCalled();
    });
  });

  it('shows forbidden state for non-friends', async () => {
    mockProtectedCall({
      sessionError: { response: { status: 403, data: { error: 'Only friends can call' } } },
    });

    renderCallRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(/only friends can call/i);
    expect(screen.getByRole('link', { name: /back to friends/i })).toHaveAttribute('href', '/app/friends');
  });

  it('shows configuration error when the Stream key is missing', async () => {
    vi.stubEnv('VITE_STREAM_API_KEY', '');
    mockProtectedCall();

    renderCallRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(/stream video key is missing/i);
  });
});
