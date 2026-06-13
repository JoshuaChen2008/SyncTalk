import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../../../../app/router';
import { apiClient } from '../../../../lib/api-client';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });

  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

function mockCurrentUser() {
  return { id: 'user-1', username: 'mei', email: 'mei@example.com' };
}

function mockProfile(overrides = {}) {
  return {
    id: 'user-1',
    username: 'mei',
    email: 'mei@example.com',
    avatar: '',
    nativeLanguage: '',
    targetLanguage: '',
    languageLevel: '',
    learningGoal: '',
    bio: '',
    timezone: '',
    isProfileComplete: false,
    ...overrides,
  };
}

function mockProtectedProfile(profile = mockProfile()) {
  vi.spyOn(apiClient, 'get').mockImplementation(async (url) => {
    if (url === '/auth/me') {
      return { data: { user: mockCurrentUser() } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/profile/me') {
      return { data: { profile } } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    if (url === '/notifications') {
      return { data: { notifications: [], unreadCount: 0 } } as Awaited<
        ReturnType<typeof apiClient.get>
      >;
    }

    if (url === '/profile/user-2') {
      return {
        data: {
          profile: {
            id: 'user-2',
            username: 'sam',
            avatar: '',
            nativeLanguage: 'English',
            targetLanguage: 'Japanese',
            languageLevel: 'B1',
            learningGoal: 'Daily conversation',
            bio: 'Coffee chats welcome.',
            timezone: 'Asia/Tokyo',
            isProfileComplete: true,
            relationshipStatus: 'friend',
          },
        },
      } as Awaited<ReturnType<typeof apiClient.get>>;
    }

    throw new Error(`Unexpected GET ${url}`);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('profile page', () => {
  it('redirects incomplete users from discover to profile', async () => {
    mockProtectedProfile();

    renderRoute('/app/discover');

    expect(
      await screen.findByRole('heading', { name: /complete your profile/i }),
    ).toBeInTheDocument();
  });

  it('renders the required language profile fields', async () => {
    mockProtectedProfile();

    renderRoute('/app/profile');

    expect(await screen.findAllByText(/mei@example.com/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/^mei$/i)).not.toHaveLength(0);
    expect(screen.getAllByText(/profile menu/i)).not.toHaveLength(0);
    expect(await screen.findByText(/avatar/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/native language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/target language/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /current level/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /learning goals/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/short bio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finish setup/i })).toBeInTheDocument();
    expect(screen.getByText(/0 of 5 required fields complete/i)).toBeInTheDocument();
    expect(screen.getByText(/missing: native language, target language, current level, learning goals, timezone/i)).toBeInTheDocument();
  });

  it('shows profile validation errors returned by the API', async () => {
    mockProtectedProfile();
    vi.spyOn(apiClient, 'patch').mockRejectedValue({
      response: { data: { error: 'Target language is required' } },
    });

    renderRoute('/app/profile');

    await screen.findByLabelText(/native language/i);
    await userEvent.click(screen.getByRole('button', { name: /finish setup/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/target language is required/i);
  });

  it('saves pill and goal card selections without changing the profile API shape', async () => {
    mockProtectedProfile();
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: {
        profile: mockProfile({
          nativeLanguage: 'Japanese',
          targetLanguage: 'English',
          languageLevel: 'B1',
          learningGoal: 'Business communication',
          bio: 'Coffee chats welcome.',
          timezone: 'Asia/Tokyo',
          isProfileComplete: true,
        }),
      },
    } as Awaited<ReturnType<typeof apiClient.patch>>);

    renderRoute('/app/profile');

    await userEvent.selectOptions(await screen.findByLabelText(/native language/i), 'Japanese');
    await userEvent.selectOptions(screen.getByLabelText(/target language/i), 'English');
    await userEvent.click(screen.getByRole('button', { name: /intermediate/i }));
    await userEvent.click(screen.getByRole('radio', { name: /work/i }));
    await userEvent.selectOptions(screen.getByLabelText(/timezone/i), 'Asia/Tokyo');
    await userEvent.type(screen.getByLabelText(/short bio/i), 'Coffee chats welcome.');
    await userEvent.click(screen.getByRole('button', { name: /finish setup/i }));

    expect(patchSpy).toHaveBeenCalledWith('/profile/me', {
      nativeLanguage: 'Japanese',
      targetLanguage: 'English',
      languageLevel: 'B1',
      learningGoal: 'Business communication',
      bio: 'Coffee chats welcome.',
      timezone: 'Asia/Tokyo',
    });
    expect(await screen.findByRole('heading', { name: /discover partners/i })).toBeInTheDocument();
  });

  it('keeps completed users on profile after saving edits and shows success feedback', async () => {
    mockProtectedProfile(
      mockProfile({
        nativeLanguage: 'Japanese',
        targetLanguage: 'English',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        bio: 'Coffee chats welcome.',
        timezone: 'Asia/Tokyo',
        isProfileComplete: true,
      }),
    );
    vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: {
        profile: mockProfile({
          nativeLanguage: 'Japanese',
          targetLanguage: 'Spanish',
          languageLevel: 'B1',
          learningGoal: 'Daily conversation',
          bio: 'Coffee chats welcome.',
          timezone: 'Asia/Tokyo',
          isProfileComplete: true,
        }),
      },
    } as Awaited<ReturnType<typeof apiClient.patch>>);

    const router = renderRoute('/app/profile');

    await userEvent.selectOptions(await screen.findByLabelText(/target language/i), 'Spanish');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/profile saved/i);
    expect(router.state.location.pathname).toBe('/app/profile');
    expect(screen.getByText(/5 of 5 required fields complete/i)).toBeInTheDocument();
  });

  it('renders another user public profile without private email', async () => {
    mockProtectedProfile(
      mockProfile({
        nativeLanguage: 'Japanese',
        targetLanguage: 'English',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        timezone: 'Asia/Tokyo',
        isProfileComplete: true,
      }),
    );

    renderRoute('/app/profile/user-2');

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.getByText(/coffee chats welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/english/i)).toBeInTheDocument();
    expect(screen.getByText(/japanese/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat with sam/i })).toHaveAttribute(
      'href',
      '/app/chat/user-2',
    );
    expect(screen.getByRole('link', { name: /call sam/i })).toHaveAttribute(
      'href',
      '/app/call/user-2',
    );
    expect(screen.queryByText(/sam@example\.com/i)).not.toBeInTheDocument();
  });

  it('shows public profile relationship guidance for non-friends', async () => {
    mockProtectedProfile(
      mockProfile({
        nativeLanguage: 'Japanese',
        targetLanguage: 'English',
        languageLevel: 'B1',
        learningGoal: 'Daily conversation',
        timezone: 'Asia/Tokyo',
        isProfileComplete: true,
      }),
    );
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === '/auth/me') {
        return { data: { user: mockCurrentUser() } } as Awaited<ReturnType<typeof apiClient.get>>;
      }

      if (url === '/profile/me') {
        return {
          data: {
            profile: mockProfile({
              nativeLanguage: 'Japanese',
              targetLanguage: 'English',
              languageLevel: 'B1',
              learningGoal: 'Daily conversation',
              timezone: 'Asia/Tokyo',
              isProfileComplete: true,
            }),
          },
        } as Awaited<ReturnType<typeof apiClient.get>>;
      }

      if (url === '/notifications') {
        return { data: { notifications: [], unreadCount: 0 } } as Awaited<
          ReturnType<typeof apiClient.get>
        >;
      }

      if (url === '/profile/user-2') {
        return {
          data: {
            profile: {
              id: 'user-2',
              username: 'sam',
              avatar: '',
              nativeLanguage: 'English',
              targetLanguage: 'Japanese',
              languageLevel: 'B1',
              learningGoal: 'Daily conversation',
              bio: '',
              timezone: 'Asia/Tokyo',
              isProfileComplete: true,
              relationshipStatus: 'stranger',
            },
          },
        } as Awaited<ReturnType<typeof apiClient.get>>;
      }

      throw new Error(`Unexpected GET ${url}`);
    });

    renderRoute('/app/profile/user-2');

    expect(await screen.findByRole('heading', { name: /sam/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /chat with sam/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /find this partner in discover/i })).toHaveAttribute(
      'href',
      '/app/discover',
    );
  });
});
