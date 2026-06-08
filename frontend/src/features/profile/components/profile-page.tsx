import { Globe2, Languages, Rocket, UserCircle } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';
import {
  AppStatePanel,
  DiscoverStyleBackground,
  DiscoverStyleVisualPanel,
  featureCardClass,
  heroContentClass,
  heroDescriptionClass,
  heroEyebrowClass,
  heroHeaderClass,
  heroIconClass,
  heroStatCardClass,
  heroTitleClass,
  pageContainerClass,
  pageShellClass,
  sectionTitleClass,
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
      <DiscoverStyleBackground />

      <div className={`relative ${pageContainerClass}`}>
        <header className={heroHeaderClass}>
          <section className={heroContentClass}>
            <div className="flex items-center gap-3">
              <span className={heroIconClass}>
                <UserCircle aria-hidden="true" size={20} />
              </span>
              <span className="text-sm font-bold uppercase text-graphite">
                {t('profile.title')}
              </span>
            </div>

            <div>
              <p className={heroEyebrowClass}>
                <Languages aria-hidden="true" size={16} />
                {profileQuery.data.isProfileComplete ? t('profile.finish') : t('profile.incomplete')}
              </p>
              <h1 id="profile-title" className={heroTitleClass}>
                {t('profile.title')}
              </h1>
              <p className={heroDescriptionClass}>{t('profile.description')}</p>
            </div>

            <div className="grid max-w-xl gap-3 text-sm font-bold text-charcoal sm:grid-cols-2">
              <p className={heroStatCardClass}>
                <span className="block text-heading-sm font-feather text-sky-blue">
                  {form.nativeLanguage ? translateDisplayValue(locale, form.nativeLanguage) : '--'}
                </span>
                {t('profile.nativeLanguage')}
              </p>
              <p className={heroStatCardClass}>
                <span className="block text-heading-sm font-feather text-duo-green">
                  {form.targetLanguage ? translateDisplayValue(locale, form.targetLanguage) : '--'}
                </span>
                {t('profile.targetLanguage')}
              </p>
            </div>
          </section>
          <DiscoverStyleVisualPanel />
        </header>

        <form
          aria-labelledby="profile-title"
          className={`${featureCardClass} grid gap-8 p-5 sm:p-8`}
          onSubmit={handleSubmit}
        >
          <div className={sectionTitleClass}>
            <Globe2 aria-hidden="true" className="text-sky-blue" size={22} />
            <p>{t('profile.title')}</p>
          </div>

          {updateProfileMutation.isError ? (
            <p className="mb-6 rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#b91c1c]" role="alert">
              {getProfileApiErrorMessage(updateProfileMutation.error)}
            </p>
          ) : null}

          {!profileQuery.data.isProfileComplete ? (
            <p className="rounded-xl border-2 border-sky-blue bg-sky-blue/10 px-4 py-3 text-sm font-bold text-sky-blue shadow-[0_3px_0_#ddf4ff]">
              {t('profile.incomplete')}
            </p>
          ) : null}

          <section className="grid gap-5 rounded-2xl border-2 border-cloud-gray bg-[#f7f7f7] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
            {profileQuery.data.avatar ? (
              <img
                alt={`${profileQuery.data.username} avatar`}
                className="h-24 w-24 rounded-full border-4 border-snow-white object-cover shadow-[0_4px_0_#e5e5e5]"
                src={profileQuery.data.avatar}
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-snow-white bg-duo-green-light text-duo-green shadow-[0_4px_0_#e5e5e5]">
                <UserCircle aria-hidden="true" size={42} />
              </div>
            )}
            <div>
              <h2 className="text-heading-sm font-feather text-almost-black">{t('profile.avatar.title')}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-graphite">
                {t('profile.avatar.description')}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

          <fieldset aria-labelledby="profile-level-label">
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

          <fieldset aria-labelledby="profile-goal-label">
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SelectField
              id="timezone"
              label={t('profile.timezone')}
              options={timezoneOptions}
              value={form.timezone}
              onChange={(value) => updateField('timezone', value)}
            />
          </div>

          <div>
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
              className="btn-3d-base btn-3d-green min-h-14 min-w-[12rem] gap-2 px-8 text-base"
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              <span>{updateProfileMutation.isPending ? t('profile.saving') : t('profile.finish')}</span>
              <Rocket aria-hidden="true" size={20} strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
