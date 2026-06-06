# Call Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SyncTalk MVP one-on-one video call module so friends can enter the same stable Stream Video call while non-friends are blocked.

**Architecture:** Mirror the completed Chat module shape: backend `service -> route -> app.js`, frontend `api -> hooks -> page -> router`, and tests at service, route, component, and Playwright smoke levels. Stream credentials stay on the backend; the frontend receives only a user token, current Stream user, friend metadata, and a stable call ID.

**Tech Stack:** Node.js, Express, MongoDB friendship lookup, Stream `@stream-io/node-sdk`, React, TypeScript, Vite, TanStack Query, React Router, Stream `@stream-io/video-react-sdk`, Vitest, React Testing Library, Playwright.

---

## Context Summary

Todo status in `docs/synctalk-mvp-vibe-coding-todo.md` shows modules 0-6 implemented. The next unchecked implementation module is `7. Call`.

Local code confirms:

- Backend has `backend/src/services/chat-service.js` and `backend/src/routes/chat.js`, but no call route or call service.
- Frontend has `frontend/src/features/chat/*`, but no `frontend/src/features/call/*`.
- `frontend/src/app/router.tsx` has `/app/chat/:friendId`, but no `/app/call/:friendId`.
- `frontend/src/features/friends/components/friends-page.tsx` already links friend cards to `/app/call/:friendId`.
- `frontend/package.json` does not include `@stream-io/video-react-sdk`.
- `backend/package.json` does not include `@stream-io/node-sdk`.

Context7 findings:

- Stream Video React SDK uses `StreamVideoClient`, `StreamVideo`, `StreamCall`, `StreamTheme`, `SpeakerLayout`, and `CallControls`.
- React client initialization supports an async `tokenProvider`.
- Server-side JavaScript token signing uses `StreamClient` from `@stream-io/node-sdk` and `client.generateUserToken({ user_id, validity_in_seconds })`.

## File Structure

- Modify: `frontend/package.json`
  Add `@stream-io/video-react-sdk`.
- Modify: `frontend/package-lock.json`
  Lock the new frontend SDK.
- Modify: `backend/package.json`
  Add `@stream-io/node-sdk`.
- Modify: `backend/package-lock.json`
  Lock the new backend SDK.
- Create: `backend/src/services/call-service.js`
  Sign Stream Video tokens, validate friend access, return stable call sessions.
- Create: `backend/src/routes/call.js`
  Expose `GET /api/call/token` and `GET /api/call/session/:friendId`.
- Modify: `backend/src/app.js`
  Inject `callService` and mount `/api/call`.
- Create: `backend/src/__tests__/call.service.test.js`
  Cover token signing, stable call ID, self/unknown/non-friend rejection.
- Create: `backend/src/__tests__/call.routes.test.js`
  Cover auth requirement and route-to-service contract.
- Create: `frontend/src/features/call/api/call-api.ts`
  Define call API types and API client functions.
- Create: `frontend/src/features/call/api/call-hooks.ts`
  Define `['call', 'token']` and `['call', 'session', friendId]` queries.
- Create: `frontend/src/features/call/components/call-page.tsx`
  Render loading, error, forbidden, joining, in-call, and leave states.
- Modify: `frontend/src/app/router.tsx`
  Add `/app/call/:friendId`.
- Create: `frontend/src/app/routes/app/__tests__/call.test.tsx`
  Mock Stream Video React SDK and cover page states.
- Modify: `frontend/e2e/auth.smoke.spec.ts`
  Add non-friend call permission smoke.
- Modify: `docs/synctalk-mvp-vibe-coding-todo.md`
  After implementation and verification, mark completed Call items and add learning recap.

## Dependency Installation

- [ ] **Step 1: Install frontend Stream Video SDK**

Run:

```powershell
cd frontend
npm install @stream-io/video-react-sdk
```

Expected: `frontend/package.json` contains `@stream-io/video-react-sdk` and `frontend/package-lock.json` updates.

- [ ] **Step 2: Install backend Stream Node SDK**

Run:

```powershell
cd backend
npm install @stream-io/node-sdk
```

Expected: `backend/package.json` contains `@stream-io/node-sdk` and `backend/package-lock.json` updates.

## Task 1: Backend Call Service

**Files:**

- Create: `backend/src/services/call-service.js`
- Test: `backend/src/__tests__/call.service.test.js`

- [ ] **Step 1: Write the service tests**

Create `backend/src/__tests__/call.service.test.js` with these cases:

```js
import { describe, expect, it, vi } from 'vitest';

import { createCallService } from '../services/call-service.js';

function createUser(overrides = {}) {
  return {
    id: 'user-2',
    username: 'sam',
    avatar: '',
    ...overrides,
  };
}

function createService({
  userRepository: userRepositoryOverrides = {},
  relationshipRepository: relationshipRepositoryOverrides = {},
  streamVideoClient: streamVideoClientOverrides = {},
} = {}) {
  const userRepository = {
    findById: vi.fn(async () => createUser()),
    ...userRepositoryOverrides,
  };
  const relationshipRepository = {
    findFriendshipBetween: vi.fn(async () => ({ id: 'friendship-1' })),
    ...relationshipRepositoryOverrides,
  };
  const streamVideoClient = {
    generateUserToken: vi.fn(({ user_id }) => `video-token-for-${user_id}`),
    upsertUsers: vi.fn(async () => undefined),
    ...streamVideoClientOverrides,
  };

  return {
    relationshipRepository,
    service: createCallService({ userRepository, relationshipRepository, streamVideoClient }),
    streamVideoClient,
    userRepository,
  };
}

describe('call service', () => {
  it('creates a Stream Video token for the current user', () => {
    const { service, streamVideoClient } = createService();

    const result = service.createToken({
      id: 'user-1',
      username: 'mei',
      avatar: 'https://example.com/mei.png',
    });

    expect(streamVideoClient.generateUserToken).toHaveBeenCalledWith({
      user_id: 'user-1',
      validity_in_seconds: 60 * 60,
    });
    expect(result).toEqual({
      token: 'video-token-for-user-1',
      user: { id: 'user-1', username: 'mei', avatar: 'https://example.com/mei.png' },
    });
  });

  it('returns a stable video call session for friends', async () => {
    const { relationshipRepository, service, streamVideoClient, userRepository } = createService({
      userRepository: {
        findById: vi.fn(async () => createUser({ id: 'user-a', username: 'lina' })),
      },
    });

    const result = await service.getSession('user-z', 'user-a');

    expect(userRepository.findById).toHaveBeenCalledWith('user-a');
    expect(relationshipRepository.findFriendshipBetween).toHaveBeenCalledWith('user-z', 'user-a');
    expect(streamVideoClient.upsertUsers).toHaveBeenCalledWith([
      { id: 'user-z' },
      { id: 'user-a', name: 'lina', image: '' },
    ]);
    expect(result).toEqual({
      callId: 'user-a-user-z',
      callType: 'default',
      friend: { id: 'user-a', username: 'lina', avatar: '' },
      members: ['user-z', 'user-a'],
    });
  });

  it('rejects non-friends before returning a call session', async () => {
    const { service, streamVideoClient } = createService({
      relationshipRepository: {
        findFriendshipBetween: vi.fn(async () => null),
      },
    });

    await expect(service.getSession('user-1', 'user-2')).rejects.toMatchObject({
      status: 403,
      message: 'Only friends can call',
    });
    expect(streamVideoClient.upsertUsers).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the failing backend service test**

Run:

```powershell
cd backend
npm run test -- src/__tests__/call.service.test.js
```

Expected: FAIL because `backend/src/services/call-service.js` does not exist.

- [ ] **Step 3: Implement `call-service.js`**

Use this structure:

```js
import { StreamClient } from '@stream-io/node-sdk';

import { env } from '../config/env.js';
import { createHttpError } from '../utils/http-error.js';
import { relationshipRepository as defaultRelationshipRepository } from './relationship-repository.js';
import { createUserRepository } from './user-repository.js';

const TOKEN_VALIDITY_SECONDS = 60 * 60;

function toId(value) {
  return String(value);
}

function getEntityId(entity) {
  return toId(entity.id ?? entity._id);
}

function getSortedCallId(firstUserId, secondUserId) {
  return [toId(firstUserId), toId(secondUserId)].sort().join('-');
}

function serializeCallUser(user) {
  return {
    id: getEntityId(user),
    username: user.username,
    avatar: user.avatar ?? '',
  };
}

let defaultStreamVideoClient;

function createDefaultStreamVideoClient() {
  if (defaultStreamVideoClient) {
    return defaultStreamVideoClient;
  }

  if (!env.streamApiKey || !env.streamApiSecret) {
    throw createHttpError(500, 'Stream Video is not configured');
  }

  defaultStreamVideoClient = new StreamClient(env.streamApiKey, env.streamApiSecret);
  return defaultStreamVideoClient;
}

export function createCallService({
  userRepository = createUserRepository(),
  relationshipRepository = defaultRelationshipRepository,
  streamVideoClient,
} = {}) {
  function getStreamVideoClient() {
    return streamVideoClient ?? createDefaultStreamVideoClient();
  }

  return {
    createToken(user) {
      const callUser = serializeCallUser(user);
      const token = getStreamVideoClient().generateUserToken({
        user_id: callUser.id,
        validity_in_seconds: TOKEN_VALIDITY_SECONDS,
      });

      return { token, user: callUser };
    },

    async getSession(userId, friendId) {
      const normalizedFriendId = toId(friendId ?? '').trim();

      if (!normalizedFriendId) {
        throw createHttpError(400, 'Friend is required');
      }

      if (userId === normalizedFriendId) {
        throw createHttpError(400, 'You cannot call yourself');
      }

      const friend = await userRepository.findById(normalizedFriendId);

      if (!friend) {
        throw createHttpError(404, 'User not found');
      }

      const friendship = await relationshipRepository.findFriendshipBetween(userId, normalizedFriendId);

      if (!friendship) {
        throw createHttpError(403, 'Only friends can call');
      }

      const friendUser = serializeCallUser(friend);
      const callId = getSortedCallId(userId, normalizedFriendId);

      await getStreamVideoClient().upsertUsers([
        { id: userId },
        { id: friendUser.id, name: friendUser.username, image: friendUser.avatar },
      ]);

      return {
        callId,
        callType: 'default',
        friend: friendUser,
        members: [userId, normalizedFriendId],
      };
    },
  };
}

export const callService = createCallService();
```

- [ ] **Step 4: Run the service test**

Run:

```powershell
cd backend
npm run test -- src/__tests__/call.service.test.js
```

Expected: PASS.

## Task 2: Backend Call Routes

**Files:**

- Create: `backend/src/routes/call.js`
- Modify: `backend/src/app.js`
- Test: `backend/src/__tests__/call.routes.test.js`

- [ ] **Step 1: Write route tests**

Create route tests mirroring `chat.routes.test.js`:

```js
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../app.js';

let server;

async function startTestServer({ authService, callService }) {
  const app = createApp({ authService, callService });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

async function request(baseUrl, path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
}

function createAuthService() {
  return {
    getCurrentUser: vi.fn(async () => ({
      id: 'user-1',
      username: 'mei',
      email: 'mei@example.com',
      avatar: '',
    })),
  };
}

afterEach(async () => {
  vi.restoreAllMocks();
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

describe('call routes', () => {
  it('requires authentication for call token', async () => {
    const callService = { createToken: vi.fn() };
    const baseUrl = await startTestServer({ authService: { getCurrentUser: vi.fn() }, callService });

    const response = await request(baseUrl, '/api/call/token');

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    expect(callService.createToken).not.toHaveBeenCalled();
  });

  it('returns a Stream Video token for the current user', async () => {
    const authService = createAuthService();
    const callService = {
      createToken: vi.fn(() => ({
        token: 'video-token',
        user: { id: 'user-1', username: 'mei', avatar: '' },
      })),
    };
    const baseUrl = await startTestServer({ authService, callService });

    const response = await request(baseUrl, '/api/call/token', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      token: 'video-token',
      user: { id: 'user-1', username: 'mei', avatar: '' },
    });
    expect(callService.createToken).toHaveBeenCalledWith({
      id: 'user-1',
      username: 'mei',
      email: 'mei@example.com',
      avatar: '',
    });
  });

  it('returns a stable call session for a friend', async () => {
    const authService = createAuthService();
    const callService = {
      getSession: vi.fn(async () => ({
        callId: 'user-1-user-2',
        callType: 'default',
        friend: { id: 'user-2', username: 'sam', avatar: '' },
        members: ['user-1', 'user-2'],
      })),
    };
    const baseUrl = await startTestServer({ authService, callService });

    const response = await request(baseUrl, '/api/call/session/user-2', {
      headers: { Cookie: 'synctalk_session=valid-token' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      callId: 'user-1-user-2',
      callType: 'default',
      friend: { id: 'user-2', username: 'sam', avatar: '' },
      members: ['user-1', 'user-2'],
    });
    expect(callService.getSession).toHaveBeenCalledWith('user-1', 'user-2');
  });
});
```

- [ ] **Step 2: Run the failing route test**

Run:

```powershell
cd backend
npm run test -- src/__tests__/call.routes.test.js
```

Expected: FAIL because `callService` is not mounted in `createApp`.

- [ ] **Step 3: Create `routes/call.js`**

Use this route:

```js
import { Router } from 'express';

import { createRequireAuth } from '../middleware/require-auth.js';

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createCallRouter(authService, callService) {
  const router = Router();
  const requireAuth = createRequireAuth(authService);

  router.get('/token', requireAuth, asyncRoute((req, res) => {
    res.status(200).json(callService.createToken(req.user));
  }));

  router.get('/session/:friendId', requireAuth, asyncRoute(async (req, res) => {
    const session = await callService.getSession(req.user.id, req.params.friendId);
    res.status(200).json(session);
  }));

  return router;
}
```

- [ ] **Step 4: Mount call routes in `app.js`**

Add imports and injection:

```js
import { callService as defaultCallService } from './services/call-service.js';
import { createCallRouter } from './routes/call.js';
```

Add `callService = defaultCallService` to `createApp` parameters and mount:

```js
app.use('/api/call', createCallRouter(authService, callService));
```

- [ ] **Step 5: Run backend route tests**

Run:

```powershell
cd backend
npm run test -- src/__tests__/call.routes.test.js
```

Expected: PASS.

## Task 3: Frontend Call API

**Files:**

- Create: `frontend/src/features/call/api/call-api.ts`
- Create: `frontend/src/features/call/api/call-hooks.ts`

- [ ] **Step 1: Create API module**

Use this structure:

```ts
import { apiClient } from '../../../lib/api-client';

export type CallUser = {
  id: string;
  username: string;
  avatar: string;
};

export type CallToken = {
  token: string;
  user: CallUser;
};

export type CallSession = {
  callId: string;
  callType: string;
  friend: CallUser;
  members: string[];
};

export async function getCallToken() {
  const response = await apiClient.get<CallToken>('/call/token');
  return response.data;
}

export async function getCallSession(friendId: string) {
  const response = await apiClient.get<CallSession>(`/call/session/${friendId}`);
  return response.data;
}

export function getCallApiErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    return error.response.data.error;
  }

  return 'Could not load call. Please try again.';
}
```

- [ ] **Step 2: Create query hooks**

Use this structure:

```ts
import { useQuery } from '@tanstack/react-query';

import { getCallSession, getCallToken } from './call-api';

export const callTokenQueryKey = ['call', 'token'] as const;

export function callSessionQueryKey(friendId: string) {
  return ['call', 'session', friendId] as const;
}

export function useCallTokenQuery() {
  return useQuery({
    queryKey: callTokenQueryKey,
    queryFn: getCallToken,
  });
}

export function useCallSessionQuery(friendId: string) {
  return useQuery({
    queryKey: callSessionQueryKey(friendId),
    queryFn: () => getCallSession(friendId),
    enabled: Boolean(friendId),
  });
}
```

## Task 4: Frontend Call Page

**Files:**

- Create: `frontend/src/features/call/components/call-page.tsx`
- Modify: `frontend/src/app/router.tsx`
- Test: `frontend/src/app/routes/app/__tests__/call.test.tsx`

- [ ] **Step 1: Write component tests with mocked SDK**

Mock `@stream-io/video-react-sdk` with:

```ts
vi.mock('@stream-io/video-react-sdk', () => ({
  CallControls: ({ onLeave }: { onLeave?: () => void }) => (
    <button type="button" onClick={onLeave}>Leave call</button>
  ),
  SpeakerLayout: () => <div>Stream speaker layout</div>,
  StreamCall: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  StreamTheme: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  StreamVideo: ({ children }: { children: ReactNode }) => (
    <section aria-label="Stream video">{children}</section>
  ),
  StreamVideoClient: vi.fn().mockImplementation(() => ({
    call: vi.fn(() => ({
      join: vi.fn(async () => undefined),
      leave: vi.fn(async () => undefined),
    })),
    disconnectUser: vi.fn(async () => undefined),
  })),
}));
```

Cover:

- loading state while `/call/session/:friendId` is pending
- successful friend session renders heading, call ID, `Stream speaker layout`, and `Leave call`
- 403 response renders `Only friends can call` and `Back to friends`
- missing `VITE_STREAM_API_KEY` renders a configuration error without creating a client

- [ ] **Step 2: Implement `call-page.tsx`**

Use:

```tsx
import {
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
```

Implementation requirements:

- Read `friendId` with `useParams`.
- Fetch token and session with `useCallTokenQuery()` and `useCallSessionQuery(friendId)`.
- Create `StreamVideoClient` only after token, user, session, and `VITE_STREAM_API_KEY` exist.
- Use `client.call(session.callType, session.callId)`.
- Call `call.join({ create: true })` in an effect and set `joining`, `joined`, and `connectionError` states.
- Cleanup with `call.leave()` and `client.disconnectUser()`.
- Render `SpeakerLayout` and `CallControls`.
- `CallControls` `onLeave` should leave the call and navigate to `/app/friends`.
- Render a link to `/app/chat/:friendId` so users can return to text chat.
- Use loading, error, and forbidden panels consistent with `chat-page.tsx`.

- [ ] **Step 3: Register the route**

Modify `frontend/src/app/router.tsx`:

```tsx
import { CallPage } from '../features/call/components/call-page';
```

Add inside `/app` children:

```tsx
{
  path: 'call/:friendId',
  element: <CallPage />,
},
```

- [ ] **Step 4: Run frontend call tests**

Run:

```powershell
cd frontend
npm run test -- src/app/routes/app/__tests__/call.test.tsx
```

Expected: PASS.

## Task 5: Playwright Smoke

**Files:**

- Modify: `frontend/e2e/auth.smoke.spec.ts`

- [ ] **Step 1: Add non-friend call smoke**

Add a test parallel to the Chat permission smoke:

```ts
test('shows a permission error when a signed-in user opens call with a non-friend', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', username: 'mei', email: 'mei@example.com' },
      }),
    });
  });
  await page.route('**/api/profile/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        profile: {
          id: 'user-1',
          username: 'mei',
          email: 'mei@example.com',
          avatar: '',
          nativeLanguage: 'Japanese',
          targetLanguage: 'English',
          languageLevel: 'B1',
          learningGoal: 'Daily conversation',
          bio: 'Coffee chats welcome.',
          timezone: 'Asia/Tokyo',
          isProfileComplete: true,
        },
      }),
    });
  });
  await page.route('**/api/notifications', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ notifications: [], unreadCount: 0 }),
    });
  });
  await page.route('**/api/call/token', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'video-token',
        user: { id: 'user-1', username: 'mei', avatar: '' },
      }),
    });
  });
  await page.route('**/api/call/session/user-2', async (route) => {
    await route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Only friends can call' }),
    });
  });

  await page.goto('/app/call/user-2');

  await expect(page.getByRole('heading', { name: /call unavailable/i })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(/only friends can call/i);
  await expect(page.getByRole('link', { name: /back to friends/i })).toHaveAttribute(
    'href',
    '/app/friends',
  );
});
```

- [ ] **Step 2: Run Smoke project**

Run:

```powershell
cd frontend
npx playwright test --project=Smoke
```

Expected: PASS.

## Task 6: Verification and Todo Update

**Files:**

- Modify: `docs/synctalk-mvp-vibe-coding-todo.md`

- [ ] **Step 1: Run fixed verification commands**

Run:

```powershell
cd frontend
npm run lint
npm run test
npx playwright test --project=Smoke
cd ../backend
npm run lint
npm run test
```

Expected: all commands PASS.

- [ ] **Step 2: Manual acceptance**

Use two valid accounts with complete profiles and a friendship:

- A opens `/app/call/<B id>`.
- B opens `/app/call/<A id>`.
- Both pages show the same stable call ID.
- Browser asks for microphone/camera permission.
- After permission, the Stream video UI renders participant media.
- Mic toggle changes audio publishing state.
- Camera toggle changes video publishing state.
- Leave call returns to `/app/friends`.
- A non-friend opening `/app/call/<other id>` sees `Only friends can call`.

- [ ] **Step 3: Update todo learning recap**

In `docs/synctalk-mvp-vibe-coding-todo.md`, mark module 7 implementation items complete after implementation and add a recap:

```md
学习复盘记录（2026-06-05）：

- 业务目标：让已成为好友的语言伙伴进入固定一对一 Stream Video call，并阻止非好友访问通话页。
- 主流程：Friends 点击 Call -> `/app/call/:friendId` -> Call token/session queries -> `/api/call/token` 和 `/api/call/session/:friendId` -> CallService 校验 Friendship -> Stream Video token/call -> Stream Video React UI 渲染通话布局和控制条。
- 状态归属：路由参数、加入中、连接错误和离开状态是 React local state；call token 和 session 是 TanStack Query；好友关系保存在 MongoDB；通话媒体、参与者和实时状态归属 Stream。
- 关键文件：`backend/src/services/call-service.js`、`backend/src/routes/call.js`、`frontend/src/features/call/components/call-page.tsx`、`frontend/src/features/call/api/call-hooks.ts`、`frontend/e2e/auth.smoke.spec.ts`。
- 学到的 3 点：Stream Video token 由后端 `@stream-io/node-sdk` 签发；一对一 call ID 使用排序后的两个用户 ID 保持稳定；设备权限错误和非好友权限错误要分开展示。
- 手动验收结果：记录双账号同 call、麦克风、摄像头、挂断、非好友 403、刷新后状态。
- 后续优化：可在 App Shell 后接入 incoming_call 通知入口，让对方从通知直接加入通话。
```

- [ ] **Step 4: Diff self-check**

Run:

```powershell
git status --short
git diff -- frontend/package.json backend/package.json backend/src/services/call-service.js backend/src/routes/call.js backend/src/app.js frontend/src/features/call/api/call-api.ts frontend/src/features/call/api/call-hooks.ts frontend/src/features/call/components/call-page.tsx frontend/src/app/router.tsx frontend/e2e/auth.smoke.spec.ts docs/synctalk-mvp-vibe-coding-todo.md
```

Expected:

- No `.env`, secrets, logs, temp files, debug output, or `node_modules`.
- Changes stay within Call module, dependency manifests, router, smoke test, and todo recap.
- No App Shell, theme, notifications expansion, group calls, or AI features.

## Execution Recommendation

Start with Call rather than App Shell because:

- It is the next unchecked module in the project todo.
- Friends page already exposes `/app/call/:friendId` links, so the route is currently a broken path.
- It completes the MVP core social loop before layout/theme polish.

Keep Chat real-time manual validation as a known environment-dependent acceptance item. It should not block Call implementation because Call has the same Stream credential dependency and can be manually validated in the same two-account Stream environment once available.
