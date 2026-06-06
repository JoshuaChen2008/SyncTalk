import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { useTranslation } from '../../../i18n/i18n-store';
import { getApiErrorMessage } from '../api/auth-api';
import { useLoginMutation } from '../api/auth-hooks';
import { AuthShell } from './auth-shell';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({ identifier, password });
      navigate('/app/discover');
    } catch {
      // The mutation error is rendered below as form-level feedback.
    }
  }

  return (
    <AuthShell>
      <section className="auth-card" aria-labelledby="login-title">
        <div className="text-center">
          <h2 id="login-title" className="text-3xl font-extrabold text-slate-900">
            {t('auth.login.title')}
          </h2>
          <p className="mt-3 text-sm text-slate-500">{t('auth.login.description')}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginMutation.isError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              role="alert"
            >
              {getApiErrorMessage(loginMutation.error)}
            </p>
          ) : null}

          <div>
            <label className="auth-label" htmlFor="email">
              {t('auth.login.email')}
            </label>
            <input
              className="auth-input"
              id="email"
              name="email"
              placeholder="you@example.com"
              type="email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="password">
              {t('auth.login.password')}
            </label>
            <input
              className="auth-input"
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
              {t('auth.login.remember')}
            </label>
            <a className="font-semibold text-indigo-600 hover:text-indigo-500" href="/auth/login">
              {t('auth.login.forgot')}
            </a>
          </div>

          <button className="auth-primary-button" type="submit" disabled={loginMutation.isPending}>
            <span>{loginMutation.isPending ? t('auth.login.pending') : t('auth.login.submit')}</span>
            <ArrowRight aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          {t('auth.login.newPrefix')}{' '}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/auth/register">
            {t('auth.login.createAccount')}
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
