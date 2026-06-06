import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { useTranslation } from '../../../i18n/i18n-store';
import { getApiErrorMessage } from '../api/auth-api';
import { useRegisterMutation } from '../api/auth-hooks';
import { AuthShell } from './auth-shell';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await registerMutation.mutateAsync({ username, email, password });
      navigate('/app/discover');
    } catch {
      // The mutation error is rendered below as form-level feedback.
    }
  }

  return (
    <AuthShell>
      <section className="auth-card" aria-labelledby="register-title">
        <div className="text-center">
          <h2 id="register-title" className="text-3xl font-extrabold text-slate-900">
            {t('auth.register.title')}
          </h2>
          <p className="mt-3 text-sm text-slate-500">{t('auth.register.description')}</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {registerMutation.isError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              role="alert"
            >
              {getApiErrorMessage(registerMutation.error)}
            </p>
          ) : null}

          <div>
            <label className="auth-label" htmlFor="username">
              {t('auth.register.username')}
            </label>
            <input
              className="auth-input"
              id="username"
              name="username"
              placeholder="synctalker"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="email">
              {t('auth.register.email')}
            </label>
            <input
              className="auth-input"
              id="email"
              name="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="auth-label" htmlFor="password">
              {t('auth.register.password')}
            </label>
            <input
              className="auth-input"
              id="password"
              name="password"
              placeholder={t('auth.register.passwordPlaceholder')}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            className="auth-primary-button"
            type="submit"
            disabled={registerMutation.isPending}
          >
            <span>
              {registerMutation.isPending ? t('auth.register.pending') : t('auth.register.submit')}
            </span>
            <ArrowRight aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          {t('auth.register.existingPrefix')}{' '}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-500" to="/auth/login">
            {t('auth.register.signInInstead')}
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
