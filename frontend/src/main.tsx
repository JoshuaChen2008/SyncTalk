import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import 'stream-chat-react/dist/css/index.css';

import { AppProvider } from './app/provider';
import { router } from './app/router';
import './styles/index.css';
import './styles/stream-overrides.css';

// React 应用入口：全站只挂一个 RouterProvider，页面切换交给 app/router.tsx 管理。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
);
