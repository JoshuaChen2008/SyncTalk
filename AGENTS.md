# AGENTS.md

默认中文回答

执行列表 @docs/synctalk-mvp-vibe-coding-todo.md

技术框架@synctalk-mvp-technical-skeleton.md

prd文档@synctalk-mvp-prd

MVP 不做：AI Agent、AI 推荐/破冰/总结、学习卡片、Push、邮件短信、群聊、多人会议、动态广场、好友分组、拉黑举报、管理后台、付费

不主动扩展无关功能

不做大范围重构，除非用户明确要求或当前任务无法安全完成。

不提交 `.env`、密钥、日志、临时文件、调试输出、`node_modules`

修改前先读相关代码和文档，避免猜测

用户最新指令优于本文档

优先用 Context7 获取当前文档

做 React 相关任务可以使用 vercel-react-best`和 vercel-composition-patterns skill

可以使用 ui-ux-pro-max优化UI

技术栈

前端：React、TypeScript、Vite、React Router、TanStack Query、Zustand、Axios、Tailwind CSS、DaisyUI、Stream Chat React SDK、Stream Video React SDK、Vitest、React Testing Library、Playwright

后端：Node.js、Express、MongoDB、JWT + HttpOnly Cookie、Stream Chat/Video token signing。

服务端状态用 TanStack Query；轻量 UI 状态用 Zustand；表单输入用 React local state

API 请求统一通过 Axios 封装

页面覆盖 loading、empty、error 状态

后端 route/controller 保持薄，业务逻辑放 service 层

只加必要抽象，不为未来功能过度设计

每完成一个模块，按顺序处理：自动验证 -> Playwright smoke -> 手动验收 -> 学习复盘 -> git diff 自查 -> 可选 commit
