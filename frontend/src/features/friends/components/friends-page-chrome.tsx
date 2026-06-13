import { type ReactNode } from 'react';

import profileCollage1 from '../../../assets/synctalk/profile-collage-1.png';
import profileCollage3 from '../../../assets/synctalk/profile-collage-3.png';
import profileCollage5 from '../../../assets/synctalk/profile-collage-5.png';
import profileCollage6 from '../../../assets/synctalk/profile-collage-6.png';

export const featureCardClass =
  'card-duo bg-snow-white';

export const discoverGlassPanel =
  'border-2 border-cloud-gray bg-snow-white';

export const pageShellClass =
  'custom-scrollbar min-h-screen overflow-y-auto bg-snow-white px-4 py-6 pb-24 text-almost-black sm:px-8 md:px-12 md:py-10 lg:pb-12';

export const pageContainerClass = 'mx-auto flex w-full max-w-5xl flex-col gap-8';

export const pageTitleClass =
  'text-heading font-feather leading-tight sm:text-heading-lg';

export const heroHeaderClass =
  'duo-shadow grid overflow-hidden rounded-2xl border-2 border-cloud-gray bg-snow-white lg:grid-cols-[1.05fr_0.95fr]';

export const heroContentClass =
  'flex min-h-[20rem] flex-col justify-between gap-8 p-6 sm:p-8';

export const heroEyebrowClass =
  'inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-duo-green-light px-3 py-1.5 text-sm font-bold text-duo-green';

export const heroTitleClass =
  'mt-4 max-w-3xl font-feather text-heading-lg leading-[1.1] text-duo-green sm:text-display';

export const heroDescriptionClass = 'mt-4 max-w-2xl text-body font-bold leading-7 text-graphite';

export const heroIconClass =
  'grid h-10 w-10 place-items-center rounded-xl bg-duo-green text-white shadow-[0_4px_0_#3f8f01]';

export const heroStatCardClass =
  'duo-shadow rounded-xl border-2 border-cloud-gray bg-snow-white px-4 py-3 text-sm font-bold text-charcoal';

export const sectionTitleClass =
  'flex items-center gap-2 text-heading-sm font-feather text-almost-black';

export function DiscoverStyleBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_12px_12px,var(--color-duo-green-light)_2px,transparent_0)] bg-[length:32px_32px] opacity-55"
    />
  );
}

export function DiscoverStyleVisualPanel() {
  return (
    <section className="surface-muted relative hidden min-h-[20rem] border-l-2 border-cloud-gray p-5 lg:block">
      <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-duo-green-light" />
      <div className="absolute bottom-10 left-10 h-16 w-16 rounded-full bg-bubblegum-pink/20" />
      <img
        alt=""
        className="absolute left-8 top-10 h-40 w-64 rotate-[-5deg] rounded-2xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
        src={profileCollage1}
      />
      <img
        alt=""
        className="absolute bottom-10 right-8 h-44 w-72 rotate-[4deg] rounded-2xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
        src={profileCollage3}
      />
      <img
        alt=""
        className="absolute bottom-8 left-14 h-28 w-48 rotate-[-2deg] rounded-2xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
        src={profileCollage6}
      />
    </section>
  );
}

export function FriendsFeatureBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-snow-white">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_12px_12px,var(--color-duo-green-light)_2px,transparent_0)] bg-[length:32px_32px] opacity-55" />
      <div className="absolute right-10 top-20 h-24 w-24 rounded-full bg-sunshine-yellow/30" />
      <div className="absolute bottom-16 left-8 h-20 w-20 rounded-full bg-sky-blue/10" />
      <img
        alt=""
        className="absolute -left-14 top-20 h-36 w-64 rotate-[-11deg] rounded-2xl border-4 border-snow-white object-cover opacity-70 shadow-[0_8px_0_#e5e5e5] sm:left-0"
        src={profileCollage1}
      />
      <img
        alt=""
        className="absolute right-8 top-24 hidden h-40 w-72 rotate-[6deg] rounded-2xl border-4 border-snow-white object-cover opacity-70 shadow-[0_8px_0_#e5e5e5] lg:block"
        src={profileCollage3}
      />
      <img
        alt=""
        className="absolute bottom-10 left-10 hidden h-36 w-72 rotate-[-8deg] rounded-2xl border-4 border-snow-white object-cover opacity-55 shadow-[0_8px_0_#e5e5e5] md:block"
        src={profileCollage5}
      />
      <img
        alt=""
        className="absolute bottom-12 right-24 hidden h-32 w-64 rotate-[8deg] rounded-2xl border-4 border-snow-white object-cover opacity-55 shadow-[0_8px_0_#e5e5e5] lg:block"
        src={profileCollage6}
      />
    </div>
  );
}

export function HeroGlassPanel({ children }: { children: ReactNode }) {
  return (
    <div className="duo-shadow rounded-2xl border-2 border-cloud-gray bg-snow-white p-6 sm:p-8">
      {children}
    </div>
  );
}

export function AppStatePanel({
  children,
  role,
}: {
  children: ReactNode;
  role?: 'alert' | 'status';
}) {
  return (
    <section className={`${featureCardClass} p-8 text-center`} role={role}>
      {children}
    </section>
  );
}
