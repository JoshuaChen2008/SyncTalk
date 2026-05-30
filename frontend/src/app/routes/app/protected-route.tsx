import { Navigate, Outlet, useLocation } from 'react-router';

import { useCurrentUserQuery } from '../../../features/auth/api/auth-hooks';
import { useMyProfileQuery } from '../../../features/profile/api/profile-hooks';

export function ProtectedRoute() {
  const location = useLocation();
  const currentUserQuery = useCurrentUserQuery();
  const profileQuery = useMyProfileQuery({ enabled: Boolean(currentUserQuery.data) });

  if (currentUserQuery.isPending) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <p className="text-sm font-semibold text-slate-600">Restoring session...</p>
      </main>
    );
  }

  if (currentUserQuery.isError || !currentUserQuery.data) {
    return <Navigate to="/auth/login" replace />;
  }

  if (profileQuery.isPending) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <p className="text-sm font-semibold text-slate-600">Checking profile...</p>
      </main>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
        <p className="text-sm font-semibold text-red-700">Profile could not be loaded.</p>
      </main>
    );
  }

  if (!profileQuery.data.isProfileComplete && location.pathname !== '/app/profile') {
    return <Navigate to="/app/profile" replace />;
  }

  return <Outlet />;
}
