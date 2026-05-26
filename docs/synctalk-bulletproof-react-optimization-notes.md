# SyncTalk 可借鉴的 Bulletproof React 优化点

本文只提取对 SyncTalk MVP 有直接价值的内容。`bulletproof-react` 更适合作为架构参考，不建议整体照搬为模板。

## 项目结构模块优化

适用内容：前端目录分层、功能模块边界。

建议采用 feature-based 结构，把大部分业务代码放到 `features/`：

```txt
frontend/src/
  app/
  components/
  features/
    auth/
    profile/
    discovery/
    friends/
    notifications/
    chat/
    call/
  lib/
  stores/
  types/
  utils/
```

每个业务模块按需要再细分：

```txt
features/friends/
  api/
  components/
  hooks/
  types/
  utils/
```

优化价值：

- 降低 Auth、好友、聊天、视频等模块互相耦合。
- 页面层负责组合，feature 内部负责自己的业务 UI 和 API。
- 后续增加 Agent 推荐、学习卡片等功能时，不会污染 MVP 主链路。

执行建议：

- MVP 初期先遵守目录约定，不急着上复杂 ESLint 约束。
- 避免跨 feature 直接引用内部组件。
- 跨模块共享内容放到 `components/`、`lib/`、`types/`、`utils/`。

## API 请求模块优化

适用内容：Axios 单例、接口声明、TanStack Query hooks。

建议建立统一 Axios 客户端：

```txt
frontend/src/lib/api-client.ts
```

核心规则：

- `baseURL` 读取 `VITE_API_BASE_URL`。
- 统一开启 `withCredentials`。
- 统一处理 API 错误。
- 401 时触发登录态失效处理。

每个接口建议 colocate 到对应 feature：

```txt
features/auth/api/login.ts
features/profile/api/get-profile.ts
features/friends/api/get-friends.ts
features/chat/api/get-chat-channel.ts
features/call/api/get-call-session.ts
```

每个 API 文件尽量包含：

- 请求参数类型。
- 响应数据类型。
- fetcher 函数。
- TanStack Query 的 query/mutation hook。

优化价值：

- 组件不直接写 Axios 请求。
- Query key、缓存刷新、错误处理更集中。
- 后续排查接口问题时路径清楚。

## 登录认证模块优化

适用内容：登录态恢复、受保护路由、HttpOnly Cookie。

SyncTalk 已确定使用 `JWT + HttpOnly Cookie`，因此前端不读取 token，不把 token 存到 `localStorage`。

建议抽象：

```txt
frontend/src/lib/auth.tsx
```

包含能力：

- `useCurrentUser`：请求 `GET /api/auth/me`。
- `useLogin`：登录成功后刷新当前用户缓存。
- `useLogout`：退出后清理当前用户缓存。
- `ProtectedRoute`：保护 `/app/*`。

路由策略：

```txt
未登录访问 /app/* -> 跳转 /auth/login
已登录访问 /auth/login -> 可跳转 /app/discover 或 /app/profile
刷新页面 -> 通过 /api/auth/me 恢复登录态
```

优化价值：

- 登录态判断不散落在每个页面。
- 刷新后恢复登录态逻辑统一。
- 和后端 HttpOnly Cookie 安全策略保持一致。

## 权限控制模块优化

适用内容：RBAC、PBAC、业务权限策略。

对 SyncTalk MVP 来说，完整 RBAC 不是重点，因为当前版本不做管理后台。更值得采用的是统一权限入口和 policy-based 权限判断。

建议建立：

```txt
frontend/src/lib/authorization.ts
```

可以保留轻量角色定义：

```ts
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
```

但 MVP 主要使用业务策略：

```ts
export const POLICIES = {
  'profile:update': (user, profile) => user.id === profile.userId,

  'friend-request:respond': (user, request) =>
    request.receiverId === user.id,

  'friend:remove': (user, friendship) =>
    friendship.userAId === user.id || friendship.userBId === user.id,

  'chat:enter': (_user, session) => session.allowed === true,

  'call:enter': (_user, session) => session.allowed === true,
};
```

前端可提供一个 `Authorization` 组件：

```tsx
<Authorization
  policyCheck={POLICIES['friend:remove'](user, friendship)}
  forbiddenFallback={null}
>
  <RemoveFriendButton />
</Authorization>
```

重要边界：

- 前端权限只优化体验，不能作为安全边界。
- 后端 service 层必须重复校验权限。
- Stream Chat/Video token 必须由后端在校验好友关系后签发。

SyncTalk MVP 重点权限：

- 只能编辑自己的资料。
- 不能给自己发好友请求。
- 不能重复发送 pending 请求。
- 只有请求接收者能接受或拒绝好友请求。
- 只有好友才能进入聊天。
- 只有好友才能进入视频通话。
- 移除好友时必须确认当前用户属于该好友关系。

## 状态管理模块优化

适用内容：TanStack Query、Zustand、React local state 的边界。

建议继续沿用 SyncTalk 技术骨架中的状态分层：

服务端状态放 TanStack Query：

```txt
当前用户、资料、推荐、搜索、好友、请求、通知、聊天频道、通话会话
```

轻量 UI 状态放 Zustand：

```txt
主题、侧边栏、通知面板、当前 UI 选择、视频浮窗
```

临时交互状态放 React local state：

```txt
表单输入、搜索框输入、弹窗开关、按钮临时状态
```

优化价值：

- 避免把服务端数据塞进 Zustand。
- 避免 Query 缓存和本地 store 双份状态打架。
- 好友请求、通知、聊天会话这类数据更容易做刷新和失效。

## 路由组织模块优化

适用内容：React Router、受保护布局、懒加载。

建议把 `/app/*` 统一挂在受保护 App Shell 下：

```txt
/auth/login
/auth/register
/app
  /discover
  /friends
  /requests
  /chat/:friendId
  /call/:friendId
  /profile
  /settings
```

推荐结构：

```txt
app/router.tsx
app/routes/auth/login.tsx
app/routes/auth/register.tsx
app/routes/app/root.tsx
app/routes/app/discover.tsx
app/routes/app/friends.tsx
```

优化价值：

- `/app/*` 统一套 `ProtectedRoute`。
- App Shell、侧边栏、移动导航只写一次。
- 页面级 loading、empty、error 状态更容易统一。

## 测试验证模块优化

适用内容：Vitest、React Testing Library、Playwright smoke。

建议优先补这些测试：

- `ProtectedRoute`：未登录跳登录页，已登录渲染子页面。
- `Authorization`：policy 通过时显示操作，失败时隐藏或显示 fallback。
- Auth 表单：错误密码、注册校验、登录成功。
- Friends：发送、接受、拒绝、重复请求状态。
- Chat/Call：非好友显示无权限状态。

Playwright smoke 重点：

- `/auth/login` 可渲染。
- 未登录访问 `/app/discover` 会跳转登录。
- 登录后能进入主应用。
- 移动端核心导航可用。

优化价值：

- 权限和登录态是 MVP 风险最高的地方，优先测试能减少返工。
- smoke 测试可以跟 todo 中的模块验收流程一致。

## 暂不采用内容

这些内容对后续有价值，但 MVP 阶段不建议提前引入：

- 完整管理后台 RBAC。
- 复杂角色矩阵。
- 大规模跨 feature ESLint 规则。
- 过度抽象的通用表单系统。
- 大规模 MSW mock，除非前后端开发明显互相阻塞。
- 为未来 Agent、学习卡片、付费系统预留复杂结构。

## 推荐落地顺序

1. Setup 阶段建立基础目录、Axios 单例、QueryClient、路由骨架。
2. Auth 阶段实现 `useCurrentUser`、登录/退出 hooks、`ProtectedRoute`。
3. Profile/Friends 阶段加入 `authorization.ts` 的 policy 结构。
4. Chat/Call 阶段把好友关系权限校验前后端同时补齐。
5. App Shell 阶段再补 UI 状态 store 和移动端导航。

