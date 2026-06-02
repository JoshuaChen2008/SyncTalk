# SyncTalk MVP Vibe Coding Todo

本文是 SyncTalk MVP 的模块推进清单。技术契约见 `docs/synctalk-mvp-technical-skeleton.md`，产品范围见 `docs/synctalk-mvp-prd.md`，Codex 默认规则见 `AGENTS.md`。

## 1. 使用方式

按模块推进。每完成一个模块，先验收和复盘，再进入下一个模块。

```txt
开发模块 -> 自动验证 -> Playwright smoke -> 手动验收 -> 学习复盘 -> git diff 自查 -> 可选 commit -> 下一个模块
```

固定验证命令：

```bash
cd frontend
npm run lint
npm run test
npx playwright test --project=Smoke

cd ../backend
npm run lint
npm run test
```

commit 是建议保存点，不是强制要求。

## 2. 通用完成检查点

自动验证：

- [x] 前端 lint 通过。
- [x] 前端 test 通过。
- [x] Playwright Smoke 通过。
- [x] 后端 lint 通过。
- [x] 后端 test 通过。

手动验收：

- [ ] 像真实用户一样走成功路径。
- [ ] 至少验证一个失败路径。
- [ ] 刷新页面后状态正确。
- [ ] 登录态、权限、跳转正确。
- [ ] 移动端或窄屏核心流程可用。
- [ ] 浏览器控制台无明显 error。

学习复盘：

- [ ] 说清楚模块业务目标。
- [ ] 说清楚前端到后端的数据流。
- [ ] 说清楚关键状态归属：React local state、TanStack Query、Zustand、MongoDB、Stream。
- [ ] 读懂 3-5 个关键文件。
- [ ] 记录 3 个知识点和 1-3 个后续优化点。

变更自查：

```bash
git status
git diff
```

- [x] 无 `.env`、密钥、日志、临时文件、调试输出。
- [x] 无无关重构或大范围格式化。
- [x] 改动范围与当前模块一致。
- [x] 已决定是否 commit。

## 3. 学习复盘短模板

```md
## 模块学习复盘：[模块名]

业务目标：
主流程：用户操作 -> 页面/组件 -> Query/Mutation -> API -> Service/DB/Stream -> UI 更新
状态归属：React local state / TanStack Query / Zustand / MongoDB / Stream
关键文件：
学到的 3 点：
手动验收结果：成功路径 / 失败路径 / 刷新状态 / 移动端 / 遗留问题
当前 git 状态：是否 commit；是否可继续下个模块
后续优化：
```

## 4. 模块推进清单

### 0. Setup

目标：初始化前后端工程、测试、lint、Playwright smoke 和环境变量模板。

实现：

- [x] 创建 `frontend/`、`backend/`。
- [x] 前端初始化 Vite + React + TypeScript。
- [x] 后端初始化 Node.js + Express。
- [x] 配置 ESLint、Prettier、Vitest、React Testing Library。
- [x] 配置 Tailwind CSS、DaisyUI、React Router、TanStack Query、Zustand、Axios。
- [x] 配置 Playwright `Smoke` project，匹配 `frontend/e2e/*.smoke.spec.ts`。
- [x] 添加前后端 `.env.example`。
- [x] 添加后端 health endpoint 和最小登录页 smoke。

验收：

- [x] 前端 dev server 可启动。
- [x] 后端 health endpoint 可响应。
- [x] `/auth/login` 可渲染。
- [x] 通用完成检查点通过。

学习：入口文件、路由入口、测试入口、Vite/Express 基础启动流程。

可选 commit：`chore(setup): scaffold frontend and backend`

### 1. Auth

目标：注册、登录、退出、恢复登录态、保护 `/app/*`。

实现：

- [x] 后端实现 `register/login/logout/me`。
- [x] 密码哈希存储，JWT 写入 HttpOnly Cookie。
- [x] 添加鉴权中间件和受保护 API。
- [x] 前端实现登录页、注册页、当前用户 query、受保护路由。
- [x] Axios 开启 `withCredentials`。

验收：

- [x] 手动注册、退出、重新登录。
- [x] 刷新页面后登录态恢复。
- [x] 清除 Cookie 后访问 `/app/*` 回到登录页。
- [x] 错误密码有清晰提示。
- [x] 通用完成检查点通过。

学习：HttpOnly Cookie vs localStorage、CORS credentials (浏览器跨域请求时，是否允许携带“身份凭证”)、`/api/auth/me`、受保护路由。

可选 commit：`feat(auth): add cookie based authentication`

### 2. Profile

目标：语言资料读取、编辑、保存、资料未完善引导。

实现：

- [x] 扩展 User 语言资料字段。
- [x] 实现 `GET/PATCH /api/profile/me`。
- [x] 校验母语、目标语言、等级、目标、时区。
- [x] 实现 `/app/profile` 页面。
- [x] 资料未完善时引导到 profile，保存后进入 discover。

验收：

- [x] 手动填写完整资料并保存。
- [x] 漏填必填项有提示。
- [x] 刷新后资料仍存在。
- [x] 新用户资料未完善会被引导。
- [x] 移动端表单可用。
- [x] 通用完成检查点通过。

学习：表单状态 vs 服务端状态、Profile query、PATCH 校验、资料完整性对推荐的影响。

可选 commit：`feat(profile): add language profile editing`

### 3. Discovery

目标：规则匹配、用户搜索、匹配理由、关系状态。

实现：

- [x] 实现推荐和搜索 API。
- [x] 推荐结果排除当前用户。
- [x] 返回匹配理由和关系状态。
- [x] 支持按用户名、语言、简介搜索。
- [x] 实现 `/app/discover` 页面和用户卡片。
- [x] 展示关系状态，避免自加、已是好友、已发送请求的重复操作入口。

验收：

- [ ] 至少两个互补语言账号能看到合理推荐。
- [x] 搜索用户名、语言、简介可用。
- [x] 自己不可添加。
- [x] 已发送请求状态正确。
- [x] 空推荐有清晰空状态。
- [x] 通用完成检查点通过。

学习：规则排序、关系状态推导、推荐与搜索 query key、mutation 后刷新。

可选 commit：`feat(discovery): add rule based recommendations`

### 4. Friends

目标：好友请求、接受/拒绝、好友列表、移除好友。

实现：

- [x] 添加 FriendRequest 和 Friendship 模型。
- [x] 实现好友请求、请求列表、接受/拒绝、好友列表、移除好友 API。
- [x] 接受请求时创建一条排序后的好友关系。
- [x] 实现 `/app/friends` 和 `/app/requests`。
- [x] 发现页接入发送好友请求。

验收：

- [ ] 两个账号走通“发请求 -> 接受 -> 双方好友列表更新”。
- [ ] 拒绝请求不会成为好友。
- [ ] 重复请求被阻止。
- [ ] 移除好友后双方列表更新。
- [ ] 刷新后好友状态正确。
- [ ] 通用完成检查点通过。

学习：FriendRequest vs Friendship、排序保存好友关系、重复关系防护、query invalidation。

可选 commit：`feat(friends): add friend requests and friendships`

### 5. Notifications

目标：站内通知、未读数量、标记已读。

实现：

- [x] 添加 Notification 模型。
- [x] 好友请求和请求接受时创建通知。
- [x] 实现通知列表和标记已读 API。
- [x] App Shell 中添加通知入口和未读数。
- [x] metadata 有效时支持跳转；无效时展示无效状态。

验收：

- [ ] 手动触发好友请求通知。
- [ ] 手动触发请求接受通知。
- [ ] 未读数量正确变化。
- [ ] 标记已读后刷新仍保持已读。
- [x] 通用完成检查点通过。

学习：业务事件聚合、metadata 跳转、未读数计算、通知与好友模块联动。

可选 commit：`feat(notifications): add in-app notifications`

### 6. Chat

目标：一对一聊天权限、稳定频道 ID、Stream Chat token、聊天 UI。

实现：

- [ ] 后端签发 Stream Chat token。
- [ ] 实现 `GET /api/chat/channel/:friendId`，先校验好友关系。
- [ ] 频道 ID 使用两个用户 ID 排序拼接。
- [ ] 前端初始化 Stream Chat client。
- [ ] 实现 `/app/chat/:friendId`，包含好友信息、消息列表、输入框和错误状态。
- [ ] 禁止空消息，非好友显示无权限。

验收：

- [ ] 两个好友账号进入同一聊天频道。
- [ ] A 发消息，B 实时收到；B 回复，A 实时收到。
- [ ] 非好友不能进入聊天。
- [ ] 通用完成检查点通过。

学习：Stream token 后端签发、频道 ID 稳定性、Stream 与业务后端的职责边界。

可选 commit：`feat(chat): add one-on-one chat session`

### 7. Call

目标：一对一视频权限、稳定 call ID、Stream Video token、通话控制。

实现：

- [ ] 后端签发 Stream Video token。
- [ ] 实现 `GET /api/call/session/:friendId`，先校验好友关系。
- [ ] call ID 使用两个用户 ID 排序拼接。
- [ ] 前端初始化 Stream Video client。
- [ ] 实现 `/app/call/:friendId`。
- [ ] 展示等待、加入中、通话中、对方离开、设备错误、连接错误。
- [ ] 支持麦克风、摄像头、挂断。

验收：

- [ ] 两个好友账号进入同一 call。
- [ ] 授权麦克风和摄像头后可通话。
- [ ] 麦克风、摄像头、挂断可用。
- [ ] 非好友不能进入通话。
- [ ] 通用完成检查点通过。

学习：Stream Video token、媒体权限失败状态、call ID 稳定性、手动验证边界。

可选 commit：`feat(call): add one-on-one video call session`

### 8. App Shell

目标：应用布局、导航、设置页、主题切换、响应式体验。

实现：

- [ ] 添加桌面侧边栏和移动导航。
- [ ] 添加通知入口。
- [ ] 实现 `/app/settings`。
- [ ] 使用 Zustand 管理主题，并本地持久化。
- [ ] 设置页展示当前用户和退出登录。
- [ ] 所有核心页面具备 loading、empty、error 状态。

验收：

- [ ] 桌面端能导航所有主页面。
- [ ] 移动端能导航所有主页面。
- [ ] 主题切换后刷新仍保留。
- [ ] 设置页退出后不能访问 `/app/*`。
- [ ] 无明显文字溢出、遮挡、横向滚动。
- [ ] 通用完成检查点通过。

学习：App Shell 职责、Zustand UI 状态、响应式主流程、UI 状态与服务端状态分工。

可选 commit：`feat(app): add responsive shell and settings`

## 5. 最终验收

- [ ] 用户可以注册、登录、退出，刷新后恢复登录态。
- [ ] 用户可以填写资料、匹配语伴、搜索用户。
- [ ] 用户可以发送、接受、拒绝好友请求，并管理好友列表。
- [ ] 通知未读数和标记已读可用。
- [ ] 好友可以一对一聊天和视频；非好友无权限。
- [ ] 桌面端和移动端都能完成核心流程。
- [ ] 主题切换可用。
