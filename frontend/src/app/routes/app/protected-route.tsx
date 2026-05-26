import { Navigate, Outlet } from 'react-router';

export function ProtectedRoute() {
  // Auth 后端接入前先固定为未登录；后续会替换为 /api/auth/me 的 current user query。
  const isAuthenticated = false;

  if (!isAuthenticated) {
    // 所有 /app/* 页面统一从这里拦截，避免每个业务页面重复写登录判断。
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
