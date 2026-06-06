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
      <section className="card-gamified" aria-labelledby="register-title">
        <div className="text-center">
          <h2 id="register-title" className="text-heading font-feather text-almost-black">
            {t('auth.register.title')}
          </h2>
          <p className="mt-3 text-sm font-bold text-graphite">{t('auth.register.description')}</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {registerMutation.isError ? (
            <p
              className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#b91c1c]"
              role="alert"
            >
              {getApiErrorMessage(registerMutation.error)}
            </p>
          ) : null}

          <div>
            <label className="label-gamified" htmlFor="username">
              {t('auth.register.username')}
            </label>
            <input
              className="input-gamified"
              id="username"
              name="username"
              placeholder="synctalker"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div>
            <label className="label-gamified" htmlFor="email">
              {t('auth.register.email')}
            </label>
            <input
              className="input-gamified"
              id="email"
              name="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="label-gamified" htmlFor="password">
              {t('auth.register.password')}
            </label>
            <input
              className="input-gamified"
              id="password"
              name="password"
              placeholder={t('auth.register.passwordPlaceholder')}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            className="btn-primary w-full"
            type="submit"
            disabled={registerMutation.isPending}
          >
            <span>
              {registerMutation.isPending ? t('auth.register.pending') : t('auth.register.submit')}
            </span>
            <ArrowRight className="ml-2" aria-hidden="true" size={18} strokeWidth={3} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-bold text-graphite">
          {t('auth.register.existingPrefix')}{' '}
          <Link className="text-sky-blue hover:text-sky-blue/80" to="/auth/login">
            {t('auth.register.signInInstead')}
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
