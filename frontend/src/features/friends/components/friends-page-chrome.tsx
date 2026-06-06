import { type ReactNode } from 'react';

import profileCollage1 from '../../../assets/synctalk/profile-collage-1.png';
import profileCollage3 from '../../../assets/synctalk/profile-collage-3.png';
import profileCollage5 from '../../../assets/synctalk/profile-collage-5.png';
import profileCollage6 from '../../../assets/synctalk/profile-collage-6.png';

export const featureCardClass =
  'card-gamified bg-snow-white';

export const discoverGlassPanel =
  'border-2 border-cloud-gray bg-snow-white';

export const pageShellClass = 'min-h-screen bg-snow-white px-4 py-5 text-almost-black sm:px-8';

export const pageContainerClass = 'mx-auto flex w-full max-w-[1140px] flex-col gap-8';

export const heroHeaderClass =
  'grid overflow-hidden rounded-xl border-2 border-cloud-gray bg-snow-white lg:grid-cols-[1.05fr_0.95fr]';

export const heroContentClass =
  'flex min-h-[20rem] flex-col justify-between gap-8 p-6 sm:p-8';

export const heroEyebrowClass =
  'inline-flex items-center gap-2 rounded-xl border-2 border-cloud-gray bg-duo-green-light px-3 py-1.5 text-sm font-bold text-duo-green';

export const heroTitleClass =
  'mt-4 max-w-3xl font-feather text-heading-lg leading-[1.1] text-duo-green sm:text-display';

export const heroDescriptionClass = 'mt-4 max-w-2xl text-body font-bold leading-7 text-graphite';

export const heroIconClass =
  'grid h-10 w-10 place-items-center rounded-xl bg-duo-green text-snow-white shadow-[0_4px_0_#3f8f01]';

export const heroStatCardClass =
  'rounded-xl border-2 border-cloud-gray bg-snow-white px-4 py-3 text-sm font-bold text-charcoal';

export const sectionTitleClass =
  'flex items-center gap-2 text-heading-sm font-feather text-almost-black';

export function DiscoverStyleBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_12px_12px,var(--color-duo-green-light)_2px,transparent_0)] bg-[length:32px_32px] opacity-40"
    />
  );
}

export function DiscoverStyleVisualPanel() {
  return (
    <section className="relative hidden min-h-[20rem] border-l-2 border-cloud-gray bg-sunshine-yellow/25 p-5 lg:block">
      <img
        alt=""
        className="absolute left-8 top-10 h-40 w-64 rotate-[-5deg] rounded-xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
        src={profileCollage1}
      />
      <img
        alt=""
        className="absolute bottom-10 right-8 h-44 w-72 rotate-[4deg] rounded-xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
        src={profileCollage3}
      />
      <img
        alt=""
        className="absolute bottom-8 left-14 h-28 w-48 rotate-[-2deg] rounded-xl border-4 border-snow-white object-cover shadow-[0_8px_0_#e5e5e5]"
        src={profileCollage6}
      />
    </section>
  );
}

export function FriendsFeatureBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(248_250_252)_0%,rgb(238_242_255)_38%,rgb(240_253_250)_70%,rgb(255_251_235)_100%)]" />
      <div className="absolute inset-x-[-10%] top-[-18rem] h-[38rem] rotate-[-6deg] bg-[linear-gradient(90deg,rgb(79_70_229_/_16%),rgb(34_197_94_/_10%),rgb(251_191_36_/_16%))] blur-3xl" />
      <div className="absolute inset-x-[-6%] bottom-[-20rem] h-[34rem] rotate-[5deg] bg-[linear-gradient(90deg,rgb(20_184_166_/_14%),rgb(255_255_255_/_0%),rgb(129_140_248_/_18%))] blur-3xl" />
      <img
        alt=""
        className="absolute -left-14 top-20 h-36 w-64 rotate-[-11deg] rounded-lg border border-white/70 object-cover opacity-54 shadow-[0_18px_45px_rgb(79_70_229_/_16%)] sm:left-0"
        src={profileCollage1}
      />
      <img
        alt=""
        className="absolute right-8 top-24 hidden h-40 w-72 rotate-[6deg] rounded-lg border border-white/70 object-cover opacity-52 shadow-[0_18px_45px_rgb(79_70_229_/_16%)] lg:block"
        src={profileCollage3}
      />
      <img
        alt=""
        className="absolute bottom-10 left-10 hidden h-36 w-72 rotate-[-8deg] rounded-lg border border-white/70 object-cover opacity-40 shadow-[0_18px_45px_rgb(79_70_229_/_12%)] md:block"
        src={profileCollage5}
      />
      <img
        alt=""
        className="absolute bottom-12 right-24 hidden h-32 w-64 rotate-[8deg] rounded-lg border border-white/70 object-cover opacity-42 shadow-[0_18px_45px_rgb(79_70_229_/_12%)] lg:block"
        src={profileCollage6}
      />
    </div>
  );
}

export function HeroGlassPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/58 p-6 shadow-[0_24px_70px_rgb(49_46_129_/_12%)] backdrop-blur-2xl sm:p-8">
      {children}
    </div>
  );
}
