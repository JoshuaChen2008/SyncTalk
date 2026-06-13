import { ArrowLeft, Clock, Globe2, Languages, MapPin, MessageCircle, Rocket, UserCircle } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { translateDisplayValue } from '../../../i18n/format';
import { useTranslation } from '../../../i18n/i18n-store';
import {
  AppStatePanel,
  pageContainerClass,
  pageShellClass,
} from '../../friends/components/friends-page-chrome';
import {
  getProfileApiErrorMessage,
  type ProfileInput,
  type PublicProfile,
} from '../api/profile-api';
import {
  useMyProfileQuery,
  usePublicProfileQuery,
  useUpdateMyProfileMutation,
} from '../api/profile-hooks';

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

function getRelationshipLabel(
  relationshipStatus: PublicProfile['relationshipStatus'],
  t: ReturnType<typeof useTranslation>['t'],
) {
  const labels: Record<PublicProfile['relationshipStatus'], string> = {
    stranger: t('discover.relationship.available'),
    request_sent: t('discover.relationship.requestSent'),
    request_received: t('discover.relationship.replyPending'),
    friend: t('discover.relationship.alreadyFriends'),
  };

  return labels[relationshipStatus];
}

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

function PublicInfoTile({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="surface-muted rounded-2xl border-2 border-cloud-gray p-5 transition-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <p className="mb-1 text-xs font-black uppercase tracking-wide text-silver">{label}</p>
      <div className="text-lg font-black text-graphite">{children}</div>
    </div>
  );
}

export function PublicProfilePage() {
  const { locale, t } = useTranslation();
  const navigate = useNavigate();
  const { userId = '' } = useParams();
  const publicProfileQuery = usePublicProfileQuery(userId);
  const profile = publicProfileQuery.data;

  if (publicProfileQuery.isPending) {
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

  if (publicProfileQuery.isError || !profile) {
    return (
      <main className={pageShellClass}>
        <div className={pageContainerClass}>
          <AppStatePanel role="alert">
            <div className="surface-error mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 shadow-[0_4px_0_rgb(254_202_202_/_0.75)]">
              <UserCircle aria-hidden="true" size={28} />
            </div>
            <h1 className="text-error mt-5 text-heading-sm font-feather">
              {t('profile.unavailable')}
            </h1>
            <p className="text-error mx-auto mt-2 max-w-md text-sm font-bold leading-6">
              {publicProfileQuery.isError
                ? getProfileApiErrorMessage(publicProfileQuery.error)
                : t('profile.unavailable')}
            </p>
          </AppStatePanel>
        </div>
      </main>
    );
  }

  const relationshipLabel = getRelationshipLabel(profile.relationshipStatus, t);
  const canChat = profile.relationshipStatus === 'friend';

  return (
    <main className="custom-scrollbar min-h-screen overflow-y-auto bg-snow-white pb-24 text-almost-black lg:pb-12">
      <header className="sticky top-0 z-20 flex min-h-16 items-center gap-4 border-b-2 border-cloud-gray bg-snow-white px-4 md:px-6">
        <button
          aria-label={t('profile.back')}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl text-graphite transition-colors hover:bg-cloud-gray/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-blue/30"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft aria-hidden="true" size={28} strokeWidth={2.6} />
        </button>
        <h1 className="text-2xl font-black text-graphite">{t('profile.publicTitle')}</h1>
      </header>

      <div className="px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <article className="duo-shadow overflow-hidden rounded-[2rem] border-2 border-cloud-gray bg-snow-white">
            <div className="relative h-40 bg-sky-blue md:h-56">
              <div className="absolute -bottom-16 left-6 z-10 h-32 w-32 overflow-hidden rounded-full border-[6px] border-snow-white bg-snow-white md:left-10 md:h-40 md:w-40">
                {profile.avatar ? (
                  <img
                    alt={`${profile.username} avatar`}
                    className="h-full w-full object-cover"
                    src={profile.avatar}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-duo-green-light text-duo-green">
                    <UserCircle aria-hidden="true" size={64} />
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 right-3 h-6 w-6 rounded-full border-4 border-snow-white bg-duo-green"
                />
              </div>
            </div>

            <div className="px-6 pb-8 pt-20 md:px-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="mb-2 text-4xl font-black text-almost-black md:text-5xl">
                    {profile.username}
                  </h2>
                  <p className="mb-4 text-lg font-bold text-duo-green">
                    {relationshipLabel}
                  </p>
                  <p className="max-w-lg text-lg font-bold leading-relaxed text-graphite">
                    {profile.bio || t('friends.defaultBio')}
                  </p>
                </div>

                <div className="flex gap-3">
                  {canChat ? (
                    <Link
                      className="btn-3d-base btn-3d-green min-h-14 gap-2 px-8 text-base"
                      to={`/app/chat/${profile.id}`}
                    >
                      <MessageCircle aria-hidden="true" size={19} />
                      {t('friends.chatWith', { name: profile.username })}
                    </Link>
                  ) : (
                    <span className="btn-3d-base btn-3d-muted min-h-14 cursor-not-allowed px-6 text-base opacity-70">
                      {relationshipLabel}
                    </span>
                  )}
                </div>
              </div>

              <hr className="my-8 rounded-full border-2 border-cloud-gray" />

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <section>
                  <h3 className="mb-4 flex items-center gap-2 text-2xl font-black text-graphite">
                    <Languages aria-hidden="true" className="text-sky-blue" size={24} />
                    {t('profile.languagesTitle')}
                  </h3>
                  <div className="space-y-4">
                    <PublicInfoTile label={t('profile.targetLanguage')}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{translateDisplayValue(locale, profile.targetLanguage) || '--'}</span>
                        <span className="rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-sm font-black text-sky-blue">
                          {profile.languageLevel || '--'}
                        </span>
                      </div>
                    </PublicInfoTile>
                    <PublicInfoTile label={t('profile.nativeLanguage')}>
                      {translateDisplayValue(locale, profile.nativeLanguage) || '--'}
                    </PublicInfoTile>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-2xl font-black text-graphite">
                    {t('profile.detailsTitle')}
                  </h3>
                  <div className="space-y-4">
                    <PublicInfoTile label={t('profile.timezone')}>
                      <span className="inline-flex items-center gap-2">
                        <MapPin aria-hidden="true" size={18} />
                        {profile.timezone || '--'}
                      </span>
                    </PublicInfoTile>
                    <PublicInfoTile label={t('profile.learningGoals')}>
                      <span className="inline-flex items-center gap-2">
                        <Clock aria-hidden="true" size={18} />
                        {translateDisplayValue(locale, profile.learningGoal) || '--'}
                      </span>
                    </PublicInfoTile>
                  </div>
                </section>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
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
            <div className="surface-error mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 shadow-[0_4px_0_rgb(254_202_202_/_0.75)]">
              <UserCircle aria-hidden="true" size={28} />
            </div>
            <h1 className="text-error mt-5 text-heading-sm font-feather">
              {t('profile.unavailable')}
            </h1>
            <p className="text-error mx-auto mt-2 max-w-md text-sm font-bold leading-6">
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
            <div className="duo-shadow-sm inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-snow-white px-3 py-1.5 text-sm font-black text-graphite">
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
              <p className="surface-error rounded-xl border-2 px-4 py-3 text-sm font-bold" role="alert">
                {getProfileApiErrorMessage(updateProfileMutation.error)}
              </p>
            ) : null}

            {!profileQuery.data.isProfileComplete ? (
              <p className="surface-info rounded-xl border-2 border-sky-blue px-4 py-3 text-sm font-bold text-sky-blue shadow-[0_3px_0_var(--color-cloud-gray)]">
                {t('profile.incomplete')}
              </p>
            ) : null}

            <section className="duo-shadow rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6">
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

            <section className="duo-shadow rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6">
              <h2 className="border-b-2 border-cloud-gray pb-2 text-xl font-feather text-graphite">
                {t('profile.menu')}
              </h2>
              <div className="divide-y-2 divide-cloud-gray">
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

            <section className="duo-shadow rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6">
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

            <section className="duo-shadow rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6">
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

            <section className="duo-shadow rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6">
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

            <section className="duo-shadow rounded-[1.75rem] border-2 border-cloud-gray bg-snow-white p-6">
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
          <div className="duo-shadow rounded-2xl border-2 border-cloud-gray bg-snow-white p-4">
            <h2 className="mb-3 px-4 text-sm font-bold text-graphite">{t('profile.menu')}</h2>
            <ul className="flex flex-col gap-1">
              <li>
                <div className="surface-info rounded-xl px-4 py-3 text-sm font-bold text-sky-blue">
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

          <div className="duo-shadow mt-6 rounded-2xl border-2 border-cloud-gray bg-snow-white p-4">
            <h3 className="mb-3 px-4 text-sm font-bold text-graphite">{t('profile.avatar.title')}</h3>
            <div className="space-y-3 px-4 py-2">
              <p className="text-heading-sm font-feather text-duo-green">
                {form.targetLanguage ? translateDisplayValue(locale, form.targetLanguage) : '--'}
              </p>
              <p className="text-sm font-bold text-graphite">
                {form.nativeLanguage ? translateDisplayValue(locale, form.nativeLanguage) : '--'}
              </p>
              <div className="surface-muted rounded-xl border-2 border-cloud-gray px-3 py-2 text-xs font-bold text-graphite">
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
