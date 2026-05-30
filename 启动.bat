@echo off
title 启动前后端项目

wt ^
  new-tab --title "前端服务" -d "D:\AgentProject\Pot2.0\frontend" powershell -NoExit -Command "npm run dev" ^
  ; new-tab --title "后端服务" -d "D:\AgentProject\Pot2.0\backend" powershell -NoExit -Command "npm run dev"

exit