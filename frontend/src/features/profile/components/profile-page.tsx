import { Globe2, Rocket, UserCircle } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';
import {
  AppStatePanel,
  pageContainerClass,
  pageShellClass,
} from '../../friends/components/friends-page-chrome';
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
      <main className={pageShellClass}>
        <div className={pageContainerClass}>
          <AppStatePanel role="status">
            <p className="text-sm font-bold text-graphite">{t('profile.loading')}</p>
          </AppStatePanel>
        </div>
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className={pageShellClass}>
        <div className={pageContainerClass}>
          <AppStatePanel role="alert">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] shadow-[0_4px_0_#fecaca]">
              <UserCircle aria-hidden="true" size={28} />
            </div>
            <h1 className="mt-5 text-heading-sm font-feather text-[#991b1b]">
              {t('profile.unavailable')}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-[#b91c1c]">
              {getProfileApiErrorMessage(profileQuery.error)}
            </p>
          </AppStatePanel>
        </div>
      </main>
    );
  }

  return (
    <main className={pageShellClass}>
      <div className={`${pageContainerClass} max-w-[1040px] gap-10 md:grid md:grid-cols-[minmax(0,1fr)_16rem] md:items-start md:gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20`}>
        <section className="min-w-0">
          <header className="mb-8 border-b-2 border-cloud-gray pb-5">
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-sm font-black text-graphite shadow-[0_2px_0_#e5e5e5]">
              <Globe2 aria-hidden="true" className="text-sky-blue" size={16} />
              {profileQuery.data.isProfileComplete ? t('profile.finish') : t('profile.incomplete')}
            </div>
            <h1 id="profile-title" className="mt-5 text-[2rem] font-feather leading-tight text-almost-black md:text-[2.5rem]">
              {t('profile.title')}
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-6 text-graphite md:text-base">
              {t('profile.description')}
            </p>
          </header>

          <form aria-labelledby="profile-title" className="space-y-6" onSubmit={handleSubmit}>
            {updateProfileMutation.isError ? (
              <p className="rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#b91c1c]" role="alert">
                {getProfileApiErrorMessage(updateProfileMutation.error)}
              </p>
            ) : null}

            {!profileQuery.data.isProfileComplete ? (
              <p className="rounded-xl border-2 border-sky-blue bg-sky-blue/10 px-4 py-3 text-sm font-bold text-sky-blue shadow-[0_3px_0_#ddf4ff]">
                {t('profile.incomplete')}
              </p>
            ) : null}

            <section className="rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6 shadow-[0_4px_0_#e5e5e5]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {profileQuery.data.avatar ? (
                  <img
                    alt={`${profileQuery.data.username} avatar`}
                    className="h-24 w-24 rounded-2xl border-4 border-cloud-gray object-cover"
                    src={profileQuery.data.avatar}
                  />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-cloud-gray bg-duo-green-light text-duo-green">
                    <UserCircle aria-hidden="true" size={42} />
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="text-heading-sm font-feather text-almost-black">
                    {profileQuery.data.username}
                  </h2>
                  <p className="mt-1 break-all text-sm font-bold text-graphite">
                    {profileQuery.data.email}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-graphite">
                    {t('profile.avatar.description')}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6 shadow-[0_4px_0_#e5e5e5]">
              <h2 className="border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
                {t('profile.menu')}
              </h2>
              <div className="divide-y-2 divide-gray-100">
                <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
                  <span className="text-sm font-bold text-graphite">{t('auth.register.username')}</span>
                  <span className="text-sm font-bold text-almost-black">{profileQuery.data.username}</span>
                </div>
                <div className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
                  <span className="text-sm font-bold text-graphite">{t('auth.login.email')}</span>
                  <span className="break-all text-sm font-bold text-almost-black">{profileQuery.data.email}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6 shadow-[0_4px_0_#e5e5e5]">
              <h2 className="border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
                {t('profile.nativeLanguage')} / {t('profile.targetLanguage')}
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            </section>

            <section className="rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6 shadow-[0_4px_0_#e5e5e5]">
              <fieldset aria-labelledby="profile-level-label">
                <legend id="profile-level-label" className="border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
                  {t('profile.currentLevel')}
                </legend>
                <div className="mt-5 flex flex-wrap gap-3">
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
            </section>

            <section className="rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6 shadow-[0_4px_0_#e5e5e5]">
              <fieldset aria-labelledby="profile-goal-label">
                <legend id="profile-goal-label" className="border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
                  {t('profile.learningGoals')}
                </legend>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </section>

            <section className="rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6 shadow-[0_4px_0_#e5e5e5]">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SelectField
                  id="timezone"
                  label={t('profile.timezone')}
                  options={timezoneOptions}
                  value={form.timezone}
                  onChange={(value) => updateField('timezone', value)}
                />
              </div>

              <div className="mt-6">
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
            </section>

            <div className="flex justify-end border-t-2 border-cloud-gray pt-6">
              <button
                className="btn-3d-base btn-3d-green min-h-14 min-w-[12rem] gap-2 px-8 text-base"
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                <span>{updateProfileMutation.isPending ? t('profile.saving') : t('profile.finish')}</span>
                <Rocket aria-hidden="true" size={20} strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </section>

        <aside className="hidden shrink-0 md:block">
          <div className="rounded-2xl border-2 border-cloud-gray bg-snow-white p-4 shadow-[0_4px_0_#e5e5e5]">
            <h2 className="mb-3 px-4 text-sm font-bold text-graphite">{t('profile.menu')}</h2>
            <ul className="flex flex-col gap-1">
              <li>
                <div className="rounded-xl bg-[#ddf4ff] px-4 py-3 text-sm font-bold text-sky-blue">
                  {t('settings.signedIn')}
                </div>
              </li>
              <li>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-graphite">
                  {t('profile.nativeLanguage')} / {t('profile.targetLanguage')}
                </div>
              </li>
              <li>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-graphite">
                  {t('profile.learningGoals')}
                </div>
              </li>
              <li>
                <div className="rounded-xl px-4 py-3 text-sm font-bold text-graphite">
                  {t('profile.shortBio')}
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 rounded-2xl border-2 border-cloud-gray bg-snow-white p-4 shadow-[0_4px_0_#e5e5e5]">
            <h3 className="mb-3 px-4 text-sm font-bold text-graphite">{t('profile.avatar.title')}</h3>
            <div className="space-y-3 px-4 py-2">
              <p className="text-heading-sm font-feather text-duo-green">
                {form.targetLanguage ? translateDisplayValue(locale, form.targetLanguage) : '--'}
              </p>
              <p className="text-sm font-bold text-graphite">
                {form.nativeLanguage ? translateDisplayValue(locale, form.nativeLanguage) : '--'}
              </p>
              <div className="rounded-xl border-2 border-cloud-gray bg-[#f7f7f7] px-3 py-2 text-xs font-bold text-graphite">
                <div>{t('profile.currentLevel')}: {form.languageLevel || '--'}</div>
                <div className="mt-1">{t('profile.timezone')}: {form.timezone || '--'}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
