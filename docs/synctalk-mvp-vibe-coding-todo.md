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

- [x] 至少两个互补语言账号能看到合理推荐。
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

- [x] 两个账号走通“发请求 -> 接受 -> 双方好友列表更新”。
- [x] 拒绝请求不会成为好友。
- [x] 重复请求被阻止。
- [x] 移除好友后双方列表更新。
- [x] 刷新后好友状态正确。
- [x] 通用完成检查点通过。

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

- [x] 手动触发好友请求通知。
- [x] 手动触发请求接受通知。
- [x] 未读数量正确变化。
- [x] 标记已读后刷新仍保持已读。
- [x] 通用完成检查点通过。

学习：业务事件聚合、metadata 跳转、未读数计算、通知与好友模块联动。

学习复盘记录（2026-06-05）：

- 业务目标：验证好友请求、接受/拒绝、好友列表、移除好友，以及好友请求/接受产生的站内通知闭环。
- 主流程：Discover 发送请求 -> Friends mutation -> `/api/friends/requests` -> FriendsService/RelationshipRepository -> NotificationService -> Requests/Friends/Notifications query 刷新 UI。
- 状态归属：表单和搜索输入是 React local state；好友、请求、通知和未读数是 TanStack Query；好友关系、请求、通知持久化在 MongoDB；本模块未接入 Stream。
- 关键文件：`frontend/src/app/routes/app/discover.tsx`、`frontend/src/features/friends/components/requests-page.tsx`、`frontend/src/features/friends/components/friends-page.tsx`、`frontend/src/features/notifications/components/notifications-page.tsx`、`backend/src/services/friends-service.js`、`backend/src/services/notifications-service.js`。
- 学到的 3 点：重复 pending 请求由后端返回 409 防护；接受请求时创建排序后的 Friendship；通知 metadata 只允许安全目标跳转。
- 手动验收结果：使用 3 个本地临时账号跑通 A 发请求给 B、B 接受、双方刷新后好友列表更新；C 请求被 A 拒绝且不成好友；重复 pending 请求被阻止；A/B 移除好友后双方列表刷新为空；好友请求和接受通知均可触发、打开目标、标记已读并刷新保持。
- 后续优化：后续进入 Chat 前，可补一个真实服务级 E2E 脚本，避免手动验收依赖当前本地 CORS/端口配置。

可选 commit：`feat(notifications): add in-app notifications`

### 6. Chat

目标：一对一聊天权限、稳定频道 ID、Stream Chat token、聊天 UI。

实现：

- [x] 后端签发 Stream Chat token。
- [x] 实现 `GET /api/chat/channel/:friendId`，先校验好友关系。
- [x] 频道 ID 使用两个用户 ID 排序拼接。
- [x] 前端初始化 Stream Chat client。
- [x] 实现 `/app/chat/:friendId`，包含好友信息、消息列表、输入框和错误状态。
- [x] 禁止空消息，非好友显示无权限。

验收：

- [x] 两个好友账号进入同一聊天频道。
- [x] A 发消息，B 实时收到；B 回复，A 实时收到。
- [x] 非好友不能进入聊天。
- [x] 通用完成检查点通过。

学习：Stream token 后端签发、频道 ID 稳定性、Stream 与业务后端的职责边界。

学习复盘记录（2026-06-05）：

- 业务目标：让已成为好友的语言伙伴进入固定一对一 Stream Chat 频道，并阻止非好友访问聊天页。
- 主流程：Friends 点击 Chat -> `/app/chat/:friendId` -> Chat token/channel queries -> `/api/chat/token` 和 `/api/chat/channel/:friendId` -> ChatService 校验 Friendship -> Stream Chat token/channel -> Stream Chat React UI 渲染消息列表和输入框。
- 状态归属：路由参数和临时连接错误是 React local state；chat token 和 channel 信息是 TanStack Query；好友关系保存在 MongoDB；消息历史、实时消息和频道状态归属 Stream。
- 关键文件：`backend/src/services/chat-service.js`、`backend/src/routes/chat.js`、`frontend/src/features/chat/components/chat-page.tsx`、`frontend/src/features/chat/api/chat-hooks.ts`、`frontend/e2e/auth.smoke.spec.ts`。
- 学到的 3 点：Stream Chat token 只能由后端用 secret 签发；一对一频道 ID 使用排序后的两个用户 ID 保持稳定；非好友权限必须在业务后端先拦截，前端只展示无权限状态。
- 手动验收结果：自动验证覆盖 token/channel service、route、前端 loading/success/403 状态和 Playwright 非好友 403 smoke；两个真实好友账号实时互发消息仍需在有效 Stream key/secret 和可用网络下做双浏览器手动验收。
- 收口补充（2026-06-05）：真实 MongoDB + Stream 服务端 API 验证通过，两个临时好友账号能创建同一个稳定频道 ID，Chat token 可签发，非好友 403 正确；浏览器端 Socket 显示 101，功能测试确认 A/B 双账号实时互发消息通过，Chat 可以验收。
- 后续优化：进入 App Shell 后可补一个专门的 Chat smoke 文件，并在具备真实 Stream 环境时记录双账号实时收发验收。

可选 commit：`feat(chat): add one-on-one chat session`

### 7. Call

目标：一对一视频权限、稳定 call ID、Stream Video token、通话控制。

实现：

- [x] 后端签发 Stream Video token。
- [x] 实现 `GET /api/call/session/:friendId`，先校验好友关系。
- [x] call ID 使用两个用户 ID 排序拼接。
- [x] 前端初始化 Stream Video client。
- [x] 实现 `/app/call/:friendId`。
- [x] 展示等待、加入中、通话中、对方离开、设备错误、连接错误。
- [x] 支持麦克风、摄像头、挂断。

验收：

- [x] 两个好友账号进入同一 call。
- [x] 授权麦克风和摄像头后可通话。
- [x] 麦克风、摄像头、挂断可用。
- [x] 非好友不能进入通话。
- [x] 通用完成检查点通过。

学习：Stream Video token、媒体权限失败状态、call ID 稳定性、手动验证边界。

学习复盘记录（2026-06-05）：

- 业务目标：让已成为好友的语言伙伴进入固定一对一 Stream Video call，并阻止非好友访问通话页。
- 主流程：Friends 点击 Call -> `/app/call/:friendId` -> Call token/session queries -> `/api/call/token` 和 `/api/call/session/:friendId` -> CallService 校验 Friendship -> Stream Video token/call -> Stream Video React UI 渲染通话布局和控制条。
- 状态归属：路由参数、加入中、连接错误和离开状态是 React local state；call token 和 session 是 TanStack Query；好友关系保存在 MongoDB；通话媒体、参与者和实时状态归属 Stream。
- 关键文件：`backend/src/services/call-service.js`、`backend/src/routes/call.js`、`frontend/src/features/call/components/call-page.tsx`、`frontend/src/features/call/api/call-hooks.ts`、`frontend/e2e/auth.smoke.spec.ts`。
- 学到的 3 点：Stream Video token 由后端 `@stream-io/node-sdk` 签发；一对一 call ID 使用排序后的两个用户 ID 保持稳定；设备权限错误和非好友权限错误要分开展示。
- 手动验收结果：自动验证覆盖 token/session service、route、前端 loading/success/403/缺少 key 状态和 Playwright 非好友 403 smoke；两个真实好友账号同 call、麦克风、摄像头和挂断仍需在有效 Stream key/secret、浏览器媒体权限和可用网络下做双浏览器手动验收。
- 收口补充（2026-06-05）：真实 MongoDB + Stream 服务端 API 验证通过，两个临时好友账号能生成同一个稳定 call ID，Video token 可签发，非好友 403 正确；浏览器麦克风、摄像头和双页面媒体通话仍需在可用浏览器媒体权限环境下手动验收。
- 最终收口补充（2026-06-06）：新增 Call 前端挂断自动测试，覆盖点击 Stream 控制条后调用 `call.leave()` 和 `videoClient.disconnectUser()`；真实麦克风、摄像头双账号媒体通话仍按 `docs/synctalk-stream-manual-acceptance.md` 在可用浏览器媒体权限环境下验收。
- 验收阻塞记录（2026-06-06）：按最终收口计划启动前端成功，后端因本机 `127.0.0.1:27017` MongoDB 未运行而卡在 `mongoose.connect()`，`/health` 不可达；本机未发现 `mongod` 命令或 MongoDB 进程。未执行真实双账号摄像头/麦克风通话，因此本节两个媒体相关验收项保持未勾选。
- 媒体收口补充（2026-06-06）：MongoDB 恢复后，使用本地前后端、真实 Stream 配置和 Chromium fake media 权限完成 A/B 双账号同 call 验收；页面补齐显式麦克风、摄像头控制按钮，验证麦克风切换、摄像头切换、双方挂断、非好友 403 和 console 无业务错误。物理摄像头/麦克风画面仍可由人工在同一清单下复核。
- 后续优化：可在 App Shell 后接入 incoming_call 通知入口，让对方从通知直接加入通话。

可选 commit：`feat(call): add one-on-one video call session`

### 8. App Shell

目标：应用布局、导航、设置页、主题切换、响应式体验。

实现：

- [x] 添加桌面侧边栏和移动导航。
- [x] 添加通知入口。
- [x] 实现 `/app/settings`。
- [x] 使用 Zustand 管理主题，并本地持久化。
- [x] 设置页展示当前用户和退出登录。
- [x] 所有核心页面具备 loading、empty、error 状态。

验收：

- [x] 桌面端能导航所有主页面。
- [x] 移动端能导航所有主页面。
- [x] 主题切换后刷新仍保留。
- [x] 设置页退出后不能访问 `/app/*`。
- [x] 无明显文字溢出、遮挡、横向滚动。
- [x] 通用完成检查点通过。

学习：App Shell 职责、Zustand UI 状态、响应式主流程、UI 状态与服务端状态分工。

学习复盘记录（2026-06-05）：

- 业务目标：把分散在各页面里的导航收敛成统一 `/app/*` 应用壳，并补齐设置页、主题切换和退出登录。
- 主流程：ProtectedRoute 校验登录和资料完整性 -> AppShell 渲染桌面侧栏/移动底栏 -> 子路由 Outlet 渲染 Discover/Friends/Requests/Notifications/Profile/Chat/Call/Settings。
- 状态归属：主题是 Zustand UI 状态并持久化到 localStorage；当前用户和通知未读数是 TanStack Query；退出登录通过 auth mutation 调用后端并导航到登录页。
- 关键文件：`frontend/src/app/routes/app/app-shell.tsx`、`frontend/src/features/settings/components/settings-page.tsx`、`frontend/src/stores/theme-store.ts`、`frontend/src/app/router.tsx`、`frontend/e2e/auth.smoke.spec.ts`。
- 学到的 3 点：React Router 嵌套路由用布局组件和 Outlet 承载共享 shell；Zustand persist 默认使用 localStorage，可用 partialize 只保存主题字段；桌面和移动导航同时存在时要避免重复 aria 名称干扰测试和读屏。
- 手动验收结果：自动测试覆盖导航链接、未读 badge、设置页用户信息、主题持久化和 logout；移动端真实浏览器布局、文字溢出和最终 Smoke 重跑仍需在本地验证权限可用时完成。
- 收口补充（2026-06-05）：新增 Playwright 移动端 Smoke，覆盖 `/app/discover`、`/app/friends`、`/app/requests`、`/app/notifications`、`/app/profile`、`/app/settings`、`/app/chat/:friendId`、`/app/call/:friendId` 的 390px 窄屏可达性、移动底部导航、横向溢出和非预期 console error。
- 后续优化：后续可把页面背景和内容容器抽成更轻的共享 chrome，进一步减少 Discover/Friends/Chat/Call 的视觉重复代码。

可选 commit：`feat(app): add responsive shell and settings`

## 5. 最终验收

- [x] 用户可以注册、登录、退出，刷新后恢复登录态。
- [x] 用户可以填写资料、匹配语伴、搜索用户。
- [x] 用户可以发送、接受、拒绝好友请求，并管理好友列表。
- [x] 通知未读数和标记已读可用。
- [x] 好友可以一对一聊天和视频；非好友无权限。
- [x] 桌面端和移动端都能完成核心流程。
- [x] 主题切换可用。

最终学习复盘记录（2026-06-05）：

- 业务目标：收口 SyncTalk MVP 的语言学习社交闭环，确认用户能从账号、资料、匹配、好友、通知一路走到 Chat/Call 权限与会话创建。
- 主流程：用户注册/登录 -> Profile 保存资料 -> Discover 推荐/搜索 -> Friends 请求/接受/拒绝/移除 -> Notifications 未读/已读 -> Chat token/channel 与 Call token/session -> App Shell 桌面/移动导航。
- 状态归属：表单输入归 React local state；用户、资料、推荐、好友、通知、Chat/Call 会话归 TanStack Query；主题归 Zustand + localStorage；用户、关系、通知归 MongoDB；消息和媒体实时状态归 Stream。
- 关键文件：`frontend/e2e/auth.smoke.spec.ts`、`frontend/src/app/routes/app/app-shell.tsx`、`frontend/src/features/chat/components/chat-page.tsx`、`frontend/src/features/call/components/call-page.tsx`、`backend/src/services/chat-service.js`、`backend/src/services/call-service.js`。
- 学到的 3 点：最终验收要把“API 会话创建”和“实时 WebSocket/媒体通话”分开记录；移动端验收可以用 Playwright 固定窄屏和 `scrollWidth` 检查固化；Stream 服务端 token/channel/session 可自动验证，但真实消息和媒体仍受 WebSocket、浏览器权限和网络环境影响。
- 手动/自动验收结果：真实 MongoDB + Stream 服务端 API 闭环通过；前端移动端 Smoke 通过；Stream Chat 浏览器端 Socket 101 且双账号实时互发消息已通过；Call token/session、非好友权限和挂断清理已有自动覆盖；Call 摄像头、麦克风真实媒体仍需浏览器媒体权限下双账号验收。
- Stream Video 收口尝试（2026-06-06）：前端本地服务可访问，后端因本机 MongoDB `127.0.0.1:27017` 不可连接而无法完成 `/health` 启动检查；当前环境未发现 `mongod` 命令或 MongoDB 进程。按计划未勾选真实媒体通话验收，待本地 MongoDB 和浏览器媒体权限可用后继续执行 `docs/synctalk-stream-manual-acceptance.md`。
- Stream Video 收口通过（2026-06-06）：MongoDB 可连接后，启动本地前后端并使用真实 Stream 配置、A/B/C 临时账号完成自动化浏览器验收；A/B 进入同一 call，麦克风和摄像头授权控制可点击，A/B 分别挂断可返回好友页，C 非好友访问 call 显示无权限，console 无业务错误。验收使用 Chromium fake media 设备，物理设备画面和声音可在最终人工演示时补充复核。
- 后续优化：按 `docs/synctalk-stream-manual-acceptance.md` 执行并记录 Stream Video 双账号媒体验收；Mongoose `new` 选项弃用警告已收口为 `returnDocument: 'after'`。
