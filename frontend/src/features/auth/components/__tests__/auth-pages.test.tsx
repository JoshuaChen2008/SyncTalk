import { render, screen } from '@testing-library/react';
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { routes } from '../../../../app/router';
import { LoginPage } from '../login-page';
import { RegisterPage } from '../register-page';

describe('auth pages', () => {
  it('renders the Figma-inspired login page with email and password fields', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

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
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

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
});

describe('router auth boundary', () => {
  it('redirects unauthenticated app routes to the login page', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/app/discover'],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});
