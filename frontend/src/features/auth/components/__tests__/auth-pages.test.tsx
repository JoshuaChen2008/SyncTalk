import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../../../../app/router';
import { apiClient } from '../../../../lib/api-client';
import { LoginPage } from '../login-page';
import { RegisterPage } from '../register-page';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderAuthPage(ui: ReactNode) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('auth pages', () => {
  it('renders the Figma-inspired login page with email and password fields', () => {
    renderAuthPage(<LoginPage />);

    expect(screen.getByRole('heading', { name: /synctalk/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create a free account/i })).toHaveAttribute(
      'href',
      '/auth/register',
    );
  });

  it('renders a registration page for username, email, and password', () => {
    renderAuthPage(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in instead/i })).toHaveAttribute(
      'href',
      '/auth/login',
    );
  });

  it('submits login credentials to the real auth API shape', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { user: { id: 'user-1', username: 'mei', email: 'mei@example.com' } },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    renderAuthPage(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email address/i), 'mei@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(postSpy).toHaveBeenCalledWith('/auth/login', {
      identifier: 'mei@example.com',
      password: 'password123',
    });
  });

  it('shows login errors returned by the API', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue({
      response: { data: { error: 'Invalid email/username or password' } },
    });
    renderAuthPage(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/email address/i), 'mei@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid email\/username or password/i,
    );
  });

  it('submits registration details to the real auth API shape', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { user: { id: 'user-1', username: 'mei', email: 'mei@example.com' } },
    } as Awaited<ReturnType<typeof apiClient.post>>);
    renderAuthPage(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/username/i), 'mei');
    await userEvent.type(screen.getByLabelText(/email address/i), 'mei@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(postSpy).toHaveBeenCalledWith('/auth/register', {
      username: 'mei',
      email: 'mei@example.com',
      password: 'password123',
    });
  });
});

describe('router auth boundary', () => {
  it('redirects unauthenticated app routes to the login page', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      response: { status: 401, data: { error: 'Authentication required' } },
    });
    const router = createMemoryRouter(routes, {
      initialEntries: ['/app/discover'],
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('restores a logged-in user from /auth/me and allows protected routes', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { user: { id: 'user-1', username: 'mei', email: 'mei@example.com' } },
    } as Awaited<ReturnType<typeof apiClient.get>>);
    const router = createMemoryRouter(routes, {
      initialEntries: ['/app/discover'],
    });

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: /discover partners/i })).toBeInTheDocument();
  });
});
