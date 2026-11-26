/**
 * 全局唯一的错误类型。页面层只需要 catch 到它并读 message 就能给出提示，
 * 不需要判断是网络错误、HTTP 错误还是业务错误。
 */
export class ApiError extends Error {
  /** 业务码；HTTP / 网络层错误时与 status 相同（网络错误为 0） */
  readonly code: number;
  /** HTTP 状态码；网络错误或超时为 0 */
  readonly status: number;
  /** 原始响应体，排查问题时用 */
  readonly detail?: unknown;

  constructor(message: string, options: { code: number; status: number; detail?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.detail = options.detail;
  }

  /** 网络不可达 / 超时 */
  get isNetworkError() {
    return this.status === 0;
  }

  /** 登录态失效，需要重新登录 */
  get isUnauthorized() {
    return this.status === 401 || this.code === 401;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** 任意异常 → 可以直接展示给用户的一句话 */
export function getErrorMessage(error: unknown, fallback = "请求失败，请稍后重试"): string {
  if (isApiError(error)) return error.message || fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
