import { http } from "@/lib/http/client";

/* ------------------------------------------------------------------ *
 * 领域模型
 * ------------------------------------------------------------------ */

export interface User {
  id: string;
  name: string;
  email: string;
  /** 头像地址，没有就用姓名首字母占位 */
  avatarUrl?: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/** 登录 / 注册成功后的返回 */
export interface AuthSession {
  token: string;
  user: User;
}

/* ------------------------------------------------------------------ *
 * 接口契约
 *
 * 页面和 AuthProvider 只依赖这个 interface。
 * mock / 真实后端只是它的两份实现，替换时页面代码一行都不用改。
 * ------------------------------------------------------------------ */

export interface AuthApi {
  login(payload: LoginPayload): Promise<AuthSession>;
  register(payload: RegisterPayload): Promise<AuthSession>;
  /** 用当前 token 换用户信息，用于刷新页面后恢复登录态 */
  me(): Promise<User>;
  logout(): Promise<void>;
}

/* ------------------------------------------------------------------ *
 * 真实后端实现（等后端就绪后把 NEXT_PUBLIC_API_MODE 改成 http）
 *
 * 约定的接口：
 *   POST /auth/login     { email, password }        -> { code, message, data: { token, user } }
 *   POST /auth/register  { name, email, password }  -> 同上
 *   GET  /auth/me                                    -> { code, message, data: User }
 *   POST /auth/logout                                -> { code, message, data: null }
 * ------------------------------------------------------------------ */

export const httpAuthApi: AuthApi = {
  login: (payload) => http.post<AuthSession>("/auth/login", payload),
  register: (payload) => http.post<AuthSession>("/auth/register", payload),
  me: () => http.get<User>("/auth/me"),
  logout: () => http.post<void>("/auth/logout"),
};
