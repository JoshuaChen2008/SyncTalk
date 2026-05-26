import axios from 'axios';

// 全站统一 Axios 实例：后续各 feature 的 API 文件都应复用它，而不是单独 new axios。
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api',
  // SyncTalk 使用 JWT + HttpOnly Cookie；前端不读取 token，只让浏览器随请求带 Cookie。
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
