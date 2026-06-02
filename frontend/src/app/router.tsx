import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';

import { DiscoverPage } from './routes/app/discover';
import { ProtectedRoute } from './routes/app/protected-route';
import { LoginPage } from '../features/auth/components/login-page';
import { FriendsPage } from '../features/friends/components/friends-page';
import { RequestsPage } from '../features/friends/components/requests-page';
import { RegisterPage } from '../features/auth/components/register-page';
import { ProfilePage } from '../features/profile/components/profile-page';

// 路由表是前端页面的总入口：这里先搭出 Auth 和受保护 App 区域的最小骨架。
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'discover',
        element: <DiscoverPage />,
      },
      {
        path: 'friends',
        element: <FriendsPage />,
      },
      {
        path: 'requests',
        element: <RequestsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
  },
];

export const router = createBrowserRouter(routes);
