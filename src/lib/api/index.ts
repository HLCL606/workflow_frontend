import { httpAuthApi, type AuthApi } from "./auth";
import { mockAuthApi } from "./mock/auth";

/**
 * 切换真实后端 / 假数据的唯一开关。
 *
 * .env.local:
 *   NEXT_PUBLIC_API_MODE=mock   # 现在：全部走本地假数据，不发请求
 *   NEXT_PUBLIC_API_MODE=http   # 以后：走 NEXT_PUBLIC_API_BASE_URL
 *
 * 页面里只 import { authApi }，永远不需要关心当前是哪种模式。
 */
export type ApiMode = "mock" | "http";

export const apiMode: ApiMode =
  process.env.NEXT_PUBLIC_API_MODE === "http" ? "http" : "mock";

export const authApi: AuthApi = apiMode === "http" ? httpAuthApi : mockAuthApi;

export type { AuthApi, AuthSession, LoginPayload, RegisterPayload, User } from "./auth";
