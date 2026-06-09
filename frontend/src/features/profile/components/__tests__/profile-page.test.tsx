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
});
