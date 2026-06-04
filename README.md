# SyncTalk MVP

SyncTalk MVP 是一个面向语言学习场景的社交协作平台。第一版目标是跑通从注册登录、完善语言资料、匹配语伴、发送好友请求、建立好友关系，到后续一对一文字聊天和视频练习的产品闭环。

当前仓库采用前后端分离结构：

- `frontend/`：React + TypeScript + Vite 前端应用
- `backend/`：Node.js + Express + MongoDB 后端服务
- `docs/`：PRD、技术骨架、模块推进清单和参考资料

## 当前进度

已实现模块：

- 账号注册、登录、退出、刷新恢复登录态
- `/app/*` 受保护路由
- 语言学习资料读取、编辑、保存
- 基于资料的规则匹配和用户搜索
- 好友请求、接受、拒绝、好友列表、移除好友
- 站内通知、未读数、标记已读

规划中的 MVP 模块：

- Stream Chat 一对一文字聊天
- Stream Video 一对一视频通话
- 设置页、主题切换和更完整的响应式 App Shell

完整范围以 [PRD](docs/synctalk-mvp-prd.md) 和 [模块 Todo](docs/synctalk-mvp-vibe-coding-todo.md) 为准。

## 技术栈

前端：

- React 19、TypeScript、Vite
- React Router、TanStack Query、Zustand、Axios
- Tailwind CSS、DaisyUI、lucide-react
- Vitest、React Testing Library、Playwright

后端：

- Node.js、Express 5
- MongoDB、Mongoose
- JWT + HttpOnly Cookie
- bcryptjs、cookie-parser、cors、dotenv

后续聊天和视频模块会接入 Stream Chat / Stream Video，由后端签发 Stream token。

## 目录结构

```txt
.
├─ frontend/
│  ├─ src/
│  │  ├─ app/              # Provider、Router、受保护路由和应用级页面入口
│  │  ├─ features/         # auth、profile、discovery、friends、notifications
│  │  ├─ lib/              # Axios client、TanStack Query client
│  │  └─ styles/
│  ├─ e2e/                 # Playwright smoke/debug 测试
│  └─ package.json
├─ backend/
│  ├─ src/
│  │  ├─ config/           # env、database
│  │  ├─ middleware/       # require-auth
│  │  ├─ models/           # User、FriendRequest、Friendship、Notification
│  │  ├─ routes/           # auth、profile、users、friends、notifications
│  │  ├─ services/         # 业务逻辑和 repository
│  │  ├─ utils/
│  │  ├─ app.js
│  │  └─ server.js
│  └─ package.json
├─ docs/
├─ AGENTS.md
└─ 启动.bat
```

## 环境要求

- Node.js 22 或兼容版本
- npm
- MongoDB 本地实例或可访问的 MongoDB 连接串

默认开发端口：

- 前端：`http://127.0.0.1:5173`
- 后端：`http://127.0.0.1:8000`

## 本地启动

安装依赖：

```bash
cd frontend
npm install

cd ../backend
npm install
```

创建环境变量文件：

```bash
cd frontend
cp .env.example .env

cd ../backend
cp .env.example .env
```

前端 `.env.example`：

```txt
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STREAM_API_KEY=
```

后端 `.env.example`：

```txt
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/synctalk
JWT_SECRET=change-me
CLIENT_ORIGIN=http://127.0.0.1:5173
STREAM_API_KEY=
STREAM_API_SECRET=
```

启动后端：

```bash
cd backend
npm run dev
```

启动前端：

```bash
cd frontend
npm run dev
```

Windows 环境也可以双击根目录的 `启动.bat`，它会通过 Windows Terminal 分别启动前端和后端服务。

## 常用命令

前端：

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run test
npm run format:check
```

后端：

```bash
cd backend
npm run dev
npm run start
npm run lint
npm run test
npm run format:check
```

Playwright Smoke：

```bash
cd frontend
npx playwright test --project=Smoke
```

Playwright 会使用 `frontend/playwright.config.ts` 自动启动测试专用前端服务：`http://127.0.0.1:5175`。

## 主要路由

前端页面：

```txt
/
/auth/login
/auth/register
/app/discover
/app/friends
/app/requests
/app/notifications
/app/profile
```

后端 API：

```txt
GET  /health

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET   /api/profile/me
PATCH /api/profile/me

GET /api/users/recommendations
GET /api/users/search?query=

POST   /api/friends/requests
GET    /api/friends/requests
PATCH  /api/friends/requests/:requestId
GET    /api/friends
DELETE /api/friends/:friendId

GET   /api/notifications
PATCH /api/notifications/:notificationId/read
```

## 开发约定

- 服务端状态使用 TanStack Query。
- 轻量 UI 状态使用 Zustand。
- 表单输入优先使用 React local state。
- API 请求统一通过 `frontend/src/lib/api-client.ts` 的 Axios client。
- 后端 route 保持薄，业务逻辑放在 service 层。
- JWT 写入 HttpOnly Cookie，前端不读取、不存储 JWT。
- 不提交 `.env`、密钥、日志、临时文件、调试输出和 `node_modules`。
- 不主动扩展 MVP 之外的功能，不做无关大范围重构。

更多工程约定见 [技术骨架](docs/synctalk-mvp-technical-skeleton.md)。

## 验证流程

每完成一个模块，按项目约定依次处理：

```txt
自动验证 -> Playwright smoke -> 手动验收 -> 学习复盘 -> git diff 自查 -> 可选 commit
```

固定自动验证命令：

```bash
cd frontend
npm run lint
npm run test
npx playwright test --project=Smoke

cd ../backend
npm run lint
npm run test
```

手动验收至少覆盖：

- 一个真实用户成功路径
- 一个失败路径
- 刷新后的状态恢复
- 登录态、权限和跳转
- 移动端或窄屏核心流程
- 浏览器控制台无明显 error

## 参考文档

- [PRD](docs/synctalk-mvp-prd.md)
- [技术骨架](docs/synctalk-mvp-technical-skeleton.md)
- [模块 Todo](docs/synctalk-mvp-vibe-coding-todo.md)
- [Bulletproof React 优化笔记](docs/synctalk-bulletproof-react-optimization-notes.md)
