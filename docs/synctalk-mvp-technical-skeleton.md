# SyncTalk MVP 技术骨架

本文是 SyncTalk MVP 的技术契约速查表。产品范围见 `docs/synctalk-mvp-prd.md`，Codex 默认规则见 `AGENTS.md`，模块执行顺序见 `docs/synctalk-mvp-vibe-coding-todo.md`。

## 1. 项目目标

SyncTalk MVP 跑通语言学习社交闭环：

```txt
注册登录 -> 完善资料 -> 匹配语伴 -> 好友请求 -> 好友关系 -> 一对一聊天 / 视频通话
```

第一版重点：React 前端工程组织、异步状态分层、Cookie 安全鉴权、Stream Chat/Video 集成、响应式社交产品体验。

## 2. 技术栈

前端：React、TypeScript、Vite、React Router、TanStack Query、Zustand、Axios、Tailwind CSS、DaisyUI、Stream Chat React SDK、Stream Video React SDK、Vitest、React Testing Library、Playwright。

后端：Node.js、Express、MongoDB、JWT + HttpOnly Cookie、Stream Chat/Video token signing。

状态边界：

- TanStack Query：当前用户、资料、推荐、搜索、好友、请求、通知、聊天频道信息、通话会话信息。
- Zustand：主题、侧边栏、通知面板、当前 UI 选择、视频浮窗等轻量 UI 状态。
- React local state：表单输入和临时交互状态。
- MongoDB：用户、资料、好友请求、好友关系、通知。
- Stream：实时聊天消息、历史消息、视频通话状态和媒体能力。

## 3. 推荐项目结构

```txt
synctalk/
  frontend/
    src/
      app/
      components/
      features/
        auth/
        profile/
        discovery/
        friends/
        chat/
        call/
        notifications/
      lib/
        api/
        query/
        stream/
      routes/
      stores/
      styles/
    e2e/
    package.json

  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
      app.js
      server.js
    package.json

  docs/
```

## 4. 前端约定

路由：

```txt
/auth/login
/auth/register
/app/discover
/app/friends
/app/requests
/app/chat/:friendId
/app/call/:friendId
/app/profile
/app/settings
```

实现规则：

- Axios 统一封装 API 请求，并开启 `withCredentials`。
- `/api/auth/me` 用于刷新后恢复登录态。
- `/app/*` 需要受保护路由；未登录跳转 `/auth/login`。
- 页面必须覆盖 loading、empty、error 状态。
- 核心流程必须支持桌面端和移动端。
- UI 使用 Tailwind CSS + DaisyUI；UI 优化可参考 `ui-ux-pro-max`。
- React 组件组织和组合模式可参考 `vercel-react-best`、`vercel-composition-patterns`；若 skill 不可用，则沿用项目现有 React 约定。

建议 Query Key：

```txt
['auth', 'me']
['profile', 'me']
['users', 'recommendations']
['users', 'search', query]
['friends', 'list']
['friends', 'requests']
['notifications']
['chat', 'channel', friendId]
['call', 'session', friendId]
```

## 5. 后端约定

基础中间件：JSON body、Cookie parser、CORS、JWT 鉴权、统一错误处理。

安全规则：

- 登录成功后生成 JWT，写入 HttpOnly Cookie。
- CORS 开启 credentials，并限制 `CLIENT_ORIGIN`。
- 前端不读取 JWT，不把 JWT 存入 localStorage。
- `STREAM_API_SECRET` 只存在后端。
- Stream Chat/Video token 只能由后端签发。

模块职责：

- auth：注册、登录、退出、当前用户。
- profile：当前用户语言资料读写。
- users：推荐用户、搜索用户、关系状态。
- friends：好友请求、好友关系、好友列表、移除好友。
- notifications：站内通知和未读状态。
- chat：好友权限校验、稳定频道 ID、Stream Chat token。
- call：好友权限校验、稳定 call ID、Stream Video token。

## 6. 数据模型

User：

```txt
id
username
email
passwordHash
avatar
nativeLanguage
targetLanguage
languageLevel
learningGoal
bio
timezone
createdAt
updatedAt
```

Notification：

```txt
id
userId
type: friend_request | friend_accepted | unread_message | incoming_call
title
content
readAt
metadata
createdAt
```

FriendRequest：

```txt
id
senderId
receiverId
status: pending | accepted | rejected
createdAt
updatedAt
```

Friendship：

```txt
id
userAId
userBId
createdAt
```

固定规则：

- username 和 email 唯一。
- passwordHash 只存哈希。
- 用户不能给自己发送好友请求。
- 同一对用户不能重复创建 pending 请求。
- Friendship 的 `userAId` / `userBId` 按固定规则排序保存。
- 聊天频道 ID：两个用户 ID 排序后拼接。
- 视频 call ID：两个用户 ID 排序后拼接。

## 7. API 契约

Auth：

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Profile：

```txt
GET   /api/profile/me
PATCH /api/profile/me
```

Users：

```txt
GET /api/users/recommendations
GET /api/users/search?query=
```

Friends：

```txt
POST   /api/friends/requests
GET    /api/friends/requests
PATCH  /api/friends/requests/:requestId
GET    /api/friends
DELETE /api/friends/:friendId
```

Chat：

```txt
GET /api/chat/token
GET /api/chat/channel/:friendId
```

Call：

```txt
GET /api/call/token
GET /api/call/session/:friendId
```

Notifications：

```txt
GET   /api/notifications
PATCH /api/notifications/:notificationId/read
```

## 8. 环境变量

前端：

```txt
VITE_API_BASE_URL
VITE_STREAM_API_KEY
```

后端：

```txt
PORT
MONGODB_URI
JWT_SECRET
CLIENT_ORIGIN
STREAM_API_KEY
STREAM_API_SECRET
```

## 9. 验证重点

- 注册、登录、退出、刷新恢复登录态。
- 未登录用户不能进入 `/app/*`。
- 资料填写、保存、未完善引导。
- 推荐、搜索、匹配理由、关系状态。
- 好友请求、接受、拒绝、好友列表、移除好友。
- 通知未读数、通知跳转、标记已读。
- 非好友不能进入聊天/视频。
- 好友双方进入同一聊天频道和同一视频 call。
- 桌面端和移动端都能完成核心流程。
