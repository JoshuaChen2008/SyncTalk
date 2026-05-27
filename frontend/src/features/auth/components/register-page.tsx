import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { AuthShell } from './auth-shell';

export function RegisterPage() {
  return (
    <AuthShell>
      <section className="auth-card" aria-labelledby="register-title">
        <div className="text-center">
          <h2 id="register-title" className="text-3xl font-extrabold text-slate-900">
            Create Your Account
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Start matching with language partners today.
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div>
            <label className="auth-label" htmlFor="username">
              Username
            </label>
            <input
              className="auth-input"
              id="username"
              name="username"
              placeholder="synctalker"
              type="text"
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="email">
              Email Address
            </label>
            <input
              className="auth-input"
              id="email"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              className="auth-input"
              id="password"
              name="password"
              placeholder="At least 8 characters"
              type="password"
            />
          </div>

          <button className="auth-primary-button" type="submit">
            <span>Create Account</span>
            <ArrowRight aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/auth/login">
            Sign in instead
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
