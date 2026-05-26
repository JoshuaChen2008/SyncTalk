import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { AuthShell } from './auth-shell';

export function LoginPage() {
  return (
    <AuthShell>
      <section className="auth-card" aria-labelledby="login-title">
        <div className="text-center">
          <h2 id="login-title" className="text-3xl font-extrabold text-slate-900">
            Welcome Back!
          </h2>
          <p className="mt-3 text-sm text-slate-500">Ready to dive back into the conversation?</p>
        </div>

        <form className="mt-8 space-y-6">
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
              placeholder="••••••••"
              type="password"
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-slate-600" htmlFor="remember">
              <input
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                id="remember"
                name="remember"
                type="checkbox"
              />
              Remember me
            </label>
            <a className="font-semibold text-indigo-600 hover:text-indigo-500" href="/auth/login">
              Forgot password?
            </a>
          </div>

          <button className="auth-primary-button" type="submit">
            <span>Sign In</span>
            <ArrowRight aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          New to SyncTalk?{' '}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/auth/register">
            Create a free account
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
