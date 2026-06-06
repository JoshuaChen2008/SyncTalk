import { Rocket, UserCircle } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';
import { getProfileApiErrorMessage, type ProfileInput } from '../api/profile-api';
import { useMyProfileQuery, useUpdateMyProfileMutation } from '../api/profile-hooks';

const languageOptions = ['English', 'Japanese', 'Korean', 'Spanish', 'French', 'German', 'Chinese'];
const levelOptions = [
  { label: 'Beginner', value: 'A1' },
  { label: 'Elementary', value: 'A2' },
  { label: 'Intermediate', value: 'B1' },
  { label: 'Advanced', value: 'C1' },
  { label: 'Fluent', value: 'C2' },
];
const goalOptions = [
  { label: 'Travel', value: 'Travel practice' },
  { label: 'Work', value: 'Business communication' },
  { label: 'Culture', value: 'Culture exchange' },
  { label: 'Conversation', value: 'Daily conversation' },
];
const timezoneOptions = [
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
];

const emptyProfileInput: ProfileInput = {
  nativeLanguage: '',
  targetLanguage: '',
  languageLevel: '',
  learningGoal: '',
  bio: '',
  timezone: '',
};

function SelectField({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: keyof ProfileInput;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale, t } = useTranslation();

  return (
    <div>
      <label className="label-gamified" htmlFor={id}>
        {label}
      </label>
      <select
        className="input-gamified w-full"
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{t('profile.select', { label: label.toLowerCase() })}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {translateDisplayValue(locale, option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProfileTopNav() {
  const { t } = useTranslation();

  return (
    <header className="relative z-10 flex h-16 items-center justify-between border-b-2 border-cloud-gray bg-snow-white px-4 sm:px-12">
      <Link className="font-feather text-heading-sm text-duo-green" to="/app/profile">
        SyncTalk
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-bold text-graphite sm:flex" aria-label={t('profile.nav.label')}>
        <Link className="hover:text-sky-blue transition-colors" to="/app/discover">{t('profile.nav.discover')}</Link>
        <Link className="hover:text-sky-blue transition-colors" to="/app/friends">{t('profile.nav.friends')}</Link>
        <Link className="hover:text-sky-blue transition-colors" to="/app/requests">{t('profile.nav.requests')}</Link>
        <span className="text-silver">{t('profile.nav.messages')}</span>
      </nav>
      <button className="grid h-10 w-10 place-items-center rounded-xl bg-transparent text-graphite hover:bg-cloud-gray transition-colors border-none cursor-pointer" type="button" aria-label={t('profile.menu')}>
        <UserCircle aria-hidden="true" size={24} strokeWidth={2.5} />
      </button>
    </header>
  );
}

export function ProfilePage() {
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const profileQuery = useMyProfileQuery();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const [form, setForm] = useState<ProfileInput>(emptyProfileInput);

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setForm({
      nativeLanguage: profileQuery.data.nativeLanguage,
      targetLanguage: profileQuery.data.targetLanguage,
      languageLevel: profileQuery.data.languageLevel,
      learningGoal: profileQuery.data.learningGoal,
      bio: profileQuery.data.bio,
      timezone: profileQuery.data.timezone,
    });
  }, [profileQuery.data]);

  function updateField(field: keyof ProfileInput, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateProfileMutation.mutateAsync(form);
      navigate('/app/discover', { replace: true });
    } catch {
      // The mutation error is rendered below as form-level feedback.
    }
  }

  if (profileQuery.isPending) {
    return (
      <main className="min-h-screen bg-snow-white flex items-center justify-center">
        <p className="text-sm font-bold text-graphite">{t('profile.loading')}</p>
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className="min-h-screen bg-snow-white p-8">
        <section className="mx-auto max-w-2xl rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] p-6 text-[#991b1b]">
          <h1 className="text-heading-sm font-feather">{t('profile.unavailable')}</h1>
          <p className="mt-2 text-sm font-bold">{getProfileApiErrorMessage(profileQuery.error)}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-snow-white text-almost-black">
      <ProfileTopNav />

      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-start justify-center p-4 sm:p-8 lg:p-12" aria-labelledby="profile-title">
        <form className="w-full max-w-3xl card-gamified" onSubmit={handleSubmit}>
          <div className="mb-10 text-center">
            <h1 id="profile-title" className="text-heading font-feather text-almost-black">
              {t('profile.title')}
            </h1>
            <p className="mt-2 text-body font-bold text-graphite">{t('profile.description')}</p>
          </div>

          {updateProfileMutation.isError ? (
            <p className="mb-6 rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#b91c1c]" role="alert">
              {getProfileApiErrorMessage(updateProfileMutation.error)}
            </p>
          ) : null}

          {!profileQuery.data.isProfileComplete ? (
            <p className="mb-6 rounded-xl border-2 border-sky-blue bg-sky-blue/10 px-4 py-3 text-sm font-bold text-sky-blue">
              {t('profile.incomplete')}
            </p>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <SelectField
              id="nativeLanguage"
              label={t('profile.nativeLanguage')}
              options={languageOptions}
              value={form.nativeLanguage}
              onChange={(value) => updateField('nativeLanguage', value)}
            />
            <SelectField
              id="targetLanguage"
              label={t('profile.targetLanguage')}
              options={languageOptions}
              value={form.targetLanguage}
              onChange={(value) => updateField('targetLanguage', value)}
            />
          </div>

          <fieldset className="mb-8" aria-labelledby="profile-level-label">
            <legend id="profile-level-label" className="label-gamified">
              {t('profile.currentLevel')}
            </legend>
            <div className="flex flex-wrap gap-3 mt-2">
              {levelOptions.map((option) => (
                <button
                  className={`min-h-[3rem] rounded-xl border-2 px-5 text-body font-bold transition-colors cursor-pointer ${
                    form.languageLevel === option.value
                      ? 'border-sky-blue bg-sky-blue/10 text-sky-blue'
                      : 'border-cloud-gray bg-snow-white text-graphite hover:border-sky-blue/50'
                  }`}
                  key={option.value}
                  type="button"
                  aria-pressed={form.languageLevel === option.value}
                  onClick={() => updateField('languageLevel', option.value)}
                >
                  {translateDisplayValue(locale, option.label)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-8" aria-labelledby="profile-goal-label">
            <legend id="profile-goal-label" className="label-gamified">
              {t('profile.learningGoals')}
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {goalOptions.map((option) => (
                <label
                  className={`flex min-h-[3.75rem] cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-body font-bold transition-colors ${
                    form.learningGoal === option.value
                      ? 'border-sky-blue bg-sky-blue/10 text-sky-blue'
                      : 'border-cloud-gray bg-snow-white text-graphite hover:border-sky-blue/50'
                  }`}
                  key={option.value}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="learningGoal"
                    value={option.value}
                    checked={form.learningGoal === option.value}
                    onChange={(event) => updateField('learningGoal', event.target.value)}
                  />
                  <span aria-hidden="true" className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 ${form.learningGoal === option.value ? 'border-sky-blue bg-sky-blue' : 'border-cloud-gray bg-snow-white'}`}>
                    {form.learningGoal === option.value && <div className="h-2 w-2 rounded-sm bg-white" />}
                  </span>
                  <span>{translateDisplayValue(locale, option.label)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <SelectField
              id="timezone"
              label={t('profile.timezone')}
              options={timezoneOptions}
              value={form.timezone}
              onChange={(value) => updateField('timezone', value)}
            />
          </div>

          <div className="mb-10">
            <label className="label-gamified" htmlFor="bio">
              {t('profile.shortBio')}
            </label>
            <textarea
              className="input-gamified h-32 py-3 resize-y"
              id="bio"
              name="bio"
              placeholder={t('profile.bioPlaceholder')}
              value={form.bio}
              onChange={(event) => updateField('bio', event.target.value)}
            />
          </div>

          <div className="flex justify-center border-t-2 border-cloud-gray pt-8">
            <button
              className="btn-primary min-w-[12rem]"
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              <span className="mr-2">{updateProfileMutation.isPending ? t('profile.saving') : t('profile.finish')}</span>
              <Rocket aria-hidden="true" size={20} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
