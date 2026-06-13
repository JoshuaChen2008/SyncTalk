import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { routes } from '../../../router';
import { apiClient } from '../../../../lib/api-client';

const {
  createMockVideoClient,
  mockCalls,
  mockCameraToggle,
  mockLocalParticipant,
  mockMicrophoneToggle,
  mockParticipants,
  mockVideoClients,
} =
  vi.hoisted(() => {
  const mockCalls: Array<{
    join: ReturnType<typeof vi.fn>;
    leave: ReturnType<typeof vi.fn>;
  }> = [];
  const mockLocalParticipant = {
    current: { isLocalParticipant: true, sessionId: 'local-session', userId: 'user-1' } as
      | { isLocalParticipant: boolean; sessionId: string; userId: string }
      | undefined,
  };
  const mockParticipants: Array<{ isLocalParticipant: boolean; sessionId: string; userId: string }> = [
    { isLocalParticipant: true, sessionId: 'local-session', userId: 'user-1' },
    { isLocalParticipant: false, sessionId: 'remote-session', userId: 'user-2' },
  ];
  const mockVideoClients: Array<{
    call: ReturnType<typeof vi.fn>;
    disconnectUser: ReturnType<typeof vi.fn>;
  }> = [];

    return {
      mockCalls,
      mockCameraToggle: vi.fn(),
      mockLocalParticipant,
      mockMicrophoneToggle: vi.fn(),
      mockParticipants,
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
  CallingState: { RINGING: 'ringing' },
  CallControls: ({ onLeave }: { onLeave?: () => void }) => (
    <button type="button" onClick={onLeave}>
      Leave call
    </button>
  ),
  ParticipantView: ({ participant }: { participant: { isLocalParticipant?: boolean; userId: string } }) => (
    <div data-testid={participant.isLocalParticipant ? 'stream-local-participant' : 'stream-remote-participant'}>
      Participant {participant.userId}
    </div>
  ),
  SpeakerLayout: () => <div>Stream speaker layout</div>,
  StreamCall: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  StreamTheme: ({ children, className }: { children: ReactNode; className?: string }) => (
    <section className={className} data-testid="stream-theme">
      {children}
    </section>
  ),
  StreamVideo: ({ children }: { children: ReactNode }) => (
    <section aria-label="Stream video">{children}</section>
  ),
  StreamVideoClient: createMockVideoClient,
  useCalls: () => [],
  useCallStateHooks: () => ({
    useCameraState: () => ({ camera: { toggle: mockCameraToggle }, isMute: false }),
    useLocalParticipant: () => mockLocalParticipant.current,
    useMicrophoneState: () => ({ microphone: { toggle: mockMicrophoneToggle }, isMute: false }),
    useParticipants: () => mockParticipants,
    useRemoteParticipants: () => mockParticipants.filter((participant) => !participant.isLocalParticipant),
  }),
}));

vi.mock('stream-chat', () => ({
  StreamChat: vi.fn(() => ({
    connectUser: vi.fn(async () => undefined),
    disconnectUser: vi.fn(async () => undefined),
    on: vi.fn(() => ({ unsubscribe: vi.fn() })),
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

function renderCallRoute() {
  const router = createMemoryRouter(routes, {
    initialEntries: [{ pathname: '/app/call/user-2', state: { skipRing: true } }],
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

    if (url === '/chat/token') {
      return {
        data: {
          token: 'chat-token',
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
  mockCameraToggle.mockClear();
  mockLocalParticipant.current = { isLocalParticipant: true, sessionId: 'local-session', userId: 'user-1' };
  mockMicrophoneToggle.mockClear();
  mockParticipants.splice(
    0,
    mockParticipants.length,
    { isLocalParticipant: true, sessionId: 'local-session', userId: 'user-1' },
    { isLocalParticipant: false, sessionId: 'remote-session', userId: 'user-2' },
  );
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
    expect(screen.getByRole('navigation', { name: /call conversations/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /active call workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/call user-1-user-2/i)).toBeInTheDocument();
    expect(screen.getByText(/live with 1 partner/i)).toBeInTheDocument();
    expect(screen.queryByText(/stream speaker layout/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('stream-theme')).toHaveClass('flex', 'h-full', 'min-h-0', 'flex-col');
    expect(screen.getByTestId('call-main-participant')).toHaveTextContent(/participant user-2/i);
    expect(screen.getByTestId('call-self-preview')).toHaveTextContent(/participant user-1/i);
    expect(screen.getByRole('button', { name: /leave call/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to chat/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
  });

  it('renders the local participant while the participant list is still warming up', async () => {
    mockParticipants.splice(0, mockParticipants.length);
    mockProtectedCall();

    renderCallRoute();

    expect(await screen.findByRole('heading', { name: /call with sam/i })).toBeInTheDocument();
    expect(screen.getByTestId('call-main-participant')).toHaveTextContent(/participant user-1/i);
    expect(screen.getByTestId('call-main-participant')).not.toHaveTextContent(/waiting for sam/i);
  });

  it('renders microphone and camera controls for an active call', async () => {
    mockProtectedCall();

    renderCallRoute();

    fireEvent.click(await screen.findByRole('button', { name: /turn off microphone/i }));
    fireEvent.click(screen.getByRole('button', { name: /turn off camera/i }));

    expect(mockMicrophoneToggle).toHaveBeenCalled();
    expect(mockCameraToggle).toHaveBeenCalled();
  });

  it('leaves the active call and disconnects the video client from the Stream controls', async () => {
    mockProtectedCall();

    renderCallRoute();

    fireEvent.click(await screen.findByRole('button', { name: /leave call/i }));

    await waitFor(() => {
      expect(mockCalls.some((call) => call.leave.mock.calls.length > 0)).toBe(true);
      expect(mockVideoClients.some((client) => client.disconnectUser.mock.calls.length > 0)).toBe(true);
    });
  });

  it('shows forbidden state for non-friends', async () => {
    mockProtectedCall({
      sessionError: { response: { status: 403, data: { error: 'Only friends can call' } } },
    });

    renderCallRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(/only friends can call/i);
    expect(screen.getByRole('link', { name: /back to chat/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
  });

  it('shows configuration error when the Stream key is missing', async () => {
    vi.stubEnv('VITE_STREAM_API_KEY', '');
    mockProtectedCall();

    renderCallRoute();

    expect(await screen.findByRole('alert')).toHaveTextContent(/stream video key is missing/i);
    expect(screen.getByRole('link', { name: /back to chat/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
  });
});
