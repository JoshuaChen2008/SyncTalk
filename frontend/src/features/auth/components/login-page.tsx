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
      <section className="card-gamified" aria-labelledby="login-title">
        <div className="text-center">
          <h2 id="login-title" className="text-heading font-feather text-almost-black">
            {t('auth.login.title')}
          </h2>
          <p className="mt-3 text-sm font-bold text-graphite">{t('auth.login.description')}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginMutation.isError ? (
            <p
              className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#b91c1c]"
              role="alert"
            >
              {getApiErrorMessage(loginMutation.error)}
            </p>
          ) : null}

          <div>
            <label className="label-gamified" htmlFor="email">
              {t('auth.login.email')}
            </label>
            <input
              className="input-gamified"
              id="email"
              name="email"
              placeholder="you@example.com"
              type="email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>

          <div>
            <label className="label-gamified" htmlFor="password">
              {t('auth.login.password')}
            </label>
            <input
              className="input-gamified"
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm font-bold">
            <label className="flex items-center gap-2 text-graphite cursor-pointer" htmlFor="remember">
              <input
                className="h-5 w-5 rounded border-2 border-cloud-gray text-duo-green focus:ring-duo-green cursor-pointer"
                id="remember"
                name="remember"
                type="checkbox"
              />
              {t('auth.login.remember')}
            </label>
            <a className="text-sky-blue hover:text-sky-blue/80" href="/auth/login">
              {t('auth.login.forgot')}
            </a>
          </div>

          <button className="btn-primary w-full" type="submit" disabled={loginMutation.isPending}>
            <span>{loginMutation.isPending ? t('auth.login.pending') : t('auth.login.submit')}</span>
            <ArrowRight className="ml-2" aria-hidden="true" size={18} strokeWidth={3} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-graphite">
          {t('auth.login.newPrefix')}{' '}
          <Link className="text-sky-blue hover:text-sky-blue/80" to="/auth/register">
            {t('auth.login.createAccount')}
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
