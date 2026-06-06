import { Rocket, UserCircle } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import profileCollage1 from '../../../assets/synctalk/profile-collage-1.png';
import profileCollage2 from '../../../assets/synctalk/profile-collage-2.png';
import profileCollage3 from '../../../assets/synctalk/profile-collage-3.png';
import profileCollage4 from '../../../assets/synctalk/profile-collage-4.png';
import profileCollage5 from '../../../assets/synctalk/profile-collage-5.png';
import profileCollage6 from '../../../assets/synctalk/profile-collage-6.png';
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

const collageImages = [
  { src: profileCollage1, className: 'profile-collage-item profile-collage-item-1' },
  { src: profileCollage2, className: 'profile-collage-item profile-collage-item-2' },
  { src: profileCollage3, className: 'profile-collage-item profile-collage-item-3' },
  { src: profileCollage4, className: 'profile-collage-item profile-collage-item-4' },
  { src: profileCollage5, className: 'profile-collage-item profile-collage-item-5' },
  { src: profileCollage6, className: 'profile-collage-item profile-collage-item-6' },
];

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
      <label className="profile-label" htmlFor={id}>
        {label}
      </label>
      <select
        className="profile-select"
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
    <header className="profile-top-nav">
      <Link className="profile-brand-link" to="/app/profile">
        SyncTalk
      </Link>
      <nav className="profile-nav-links" aria-label={t('profile.nav.label')}>
        <Link to="/app/discover">{t('profile.nav.discover')}</Link>
        <Link to="/app/friends">{t('profile.nav.friends')}</Link>
        <Link to="/app/requests">{t('profile.nav.requests')}</Link>
        <span>{t('profile.nav.messages')}</span>
      </nav>
      <button className="profile-icon-button" type="button" aria-label={t('profile.menu')}>
        <UserCircle aria-hidden="true" size={22} strokeWidth={2.2} />
      </button>
    </header>
  );
}

function ProfileBackground() {
  return (
    <div className="profile-background" aria-hidden="true">
      <div className="profile-background-lines" />
      {collageImages.map((image) => (
        <img alt="" className={image.className} key={image.src} src={image.src} />
      ))}
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
      <main className="profile-page-shell">
        <p className="profile-status-text">{t('profile.loading')}</p>
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className="profile-page-shell">
        <section className="profile-error-panel">
          <h1 className="text-2xl font-bold">{t('profile.unavailable')}</h1>
          <p className="mt-2 text-sm">{getProfileApiErrorMessage(profileQuery.error)}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page-shell">
      <ProfileBackground />
      <ProfileTopNav />

      <section className="profile-content-canvas" aria-labelledby="profile-title">
        <form className="profile-glass-card" onSubmit={handleSubmit}>
          <div className="profile-heading">
            <h1 id="profile-title">{t('profile.title')}</h1>
            <p>{t('profile.description')}</p>
          </div>

          {updateProfileMutation.isError ? (
            <p className="profile-alert profile-alert-error" role="alert">
              {getProfileApiErrorMessage(updateProfileMutation.error)}
            </p>
          ) : null}

          {!profileQuery.data.isProfileComplete ? (
            <p className="profile-alert profile-alert-info">
              {t('profile.incomplete')}
            </p>
          ) : null}

          <div className="profile-form-grid">
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

          <fieldset className="profile-choice-section" aria-labelledby="profile-level-label">
            <legend id="profile-level-label" className="profile-label">
              {t('profile.currentLevel')}
            </legend>
            <div className="profile-level-options">
              {levelOptions.map((option) => (
                <button
                  className={
                    form.languageLevel === option.value
                      ? 'profile-level-pill profile-level-pill-active'
                      : 'profile-level-pill'
                  }
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

          <fieldset className="profile-choice-section" aria-labelledby="profile-goal-label">
            <legend id="profile-goal-label" className="profile-label">
              {t('profile.learningGoals')}
            </legend>
            <div className="profile-goal-grid">
              {goalOptions.map((option) => (
                <label
                  className={
                    form.learningGoal === option.value
                      ? 'profile-goal-card profile-goal-card-active'
                      : 'profile-goal-card'
                  }
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
                  <span aria-hidden="true" className="profile-goal-check" />
                  <span>{translateDisplayValue(locale, option.label)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="profile-form-grid profile-form-grid-narrow">
            <SelectField
              id="timezone"
              label={t('profile.timezone')}
              options={timezoneOptions}
              value={form.timezone}
              onChange={(value) => updateField('timezone', value)}
            />
          </div>

          <div>
            <label className="profile-label" htmlFor="bio">
              {t('profile.shortBio')}
            </label>
            <textarea
              className="profile-textarea"
              id="bio"
              name="bio"
              placeholder={t('profile.bioPlaceholder')}
              value={form.bio}
              onChange={(event) => updateField('bio', event.target.value)}
            />
          </div>

          <div className="profile-submit-row">
            <button
              className="profile-finish-button"
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              <span>{updateProfileMutation.isPending ? t('profile.saving') : t('profile.finish')}</span>
              <Rocket aria-hidden="true" size={18} strokeWidth={2.2} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
