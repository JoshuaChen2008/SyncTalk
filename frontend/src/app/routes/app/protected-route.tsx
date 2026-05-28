import { Navigate, Outlet } from 'react-router';

import { useCurrentUserQuery } from '../../../features/auth/api/auth-hooks';

export function ProtectedRoute() {
  const currentUserQuery = useCurrentUserQuery();

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

  return <Outlet />;
}
