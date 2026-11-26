import { tokenStorage } from "@/lib/auth/token";
import { ApiError } from "./errors";
import type { ApiEnvelope, RequestOptions } from "./types";

/**
 * 接口基地址。mock 模式下不会真的发请求，这个值无所谓；
 * 接真实后端时改成 .env.local 里的 NEXT_PUBLIC_API_BASE_URL 即可。
 */
const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api").replace(/\/+$/, "");
const DEFAULT_TIMEOUT = 15_000;

/**
 * 登录态失效（401）的全局回调，由 AuthProvider 注册：
 * 清掉本地登录态并跳转到登录页，业务代码不用各自处理。
 */
let unauthorizedHandler: (() => void) | null = null;

export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const isAbsolute = /^https?:\/\//i.test(path);
  const base = isAbsolute ? "" : BASE_URL;
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  if (!params) return url;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }

  const query = search.toString();
  return query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** HTTP 非 2xx：优先用后端给的 message，其次用状态码兜底文案 */
function toHttpError(status: number, payload: unknown): ApiError {
  const body = payload as Partial<ApiEnvelope<unknown>> | null;
  const message =
    (typeof body?.message === "string" && body.message) ||
    (typeof (body as { error?: string } | null)?.error === "string" && (body as { error: string }).error) ||
    FALLBACK_MESSAGES[status] ||
    `请求失败（${status}）`;

  return new ApiError(message, { code: status, status, detail: payload });
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "请求参数有误",
  401: "登录已过期，请重新登录",
  403: "没有权限执行该操作",
  404: "请求的接口不存在",
  409: "数据已存在",
  422: "提交的内容校验未通过",
  429: "操作太频繁，请稍后再试",
  500: "服务器开小差了，请稍后重试",
  502: "网关异常，请稍后重试",
  503: "服务暂时不可用，请稍后重试",
};

/**
 * 唯一的请求出口。所有接口最终都走这里：
 * 拼 URL → 带 token → 超时控制 → 解包统一响应体 → 归一化错误。
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    params,
    body,
    timeout = DEFAULT_TIMEOUT,
    auth = true,
    raw = false,
    headers,
    ...rest
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const token = auth ? tokenStorage.get() : null;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      ...rest,
      method,
      signal: controller.signal,
      // 后端换成 Cookie 方案时，这一行就是关键
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body === undefined ? null : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : null),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    throw new ApiError(aborted ? "请求超时，请稍后重试" : "网络异常，请检查网络后重试", {
      code: 0,
      status: 0,
      detail: error,
    });
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  const payload = text ? parseJson(text) : null;

  if (!response.ok) {
    const error = toHttpError(response.status, payload);
    if (error.isUnauthorized) unauthorizedHandler?.();
    throw error;
  }

  // 空响应体（如 204）直接返回 null
  if (payload === null) return null as T;
  if (raw) return payload as T;

  // 统一响应体解包：有 code 字段就按约定处理，否则当成裸数据返回
  const envelope = payload as Partial<ApiEnvelope<T>>;
  if (typeof envelope.code !== "number") return payload as T;

  if (envelope.code !== 0) {
    const error = new ApiError(envelope.message || "请求失败", {
      code: envelope.code,
      status: response.status,
      detail: payload,
    });
    if (error.isUnauthorized) unauthorizedHandler?.();
    throw error;
  }

  return envelope.data as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
