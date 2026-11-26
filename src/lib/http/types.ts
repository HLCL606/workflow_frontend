/**
 * 请求层类型定义。
 *
 * 后端接口约定的统一响应体：
 *   { "code": 0, "message": "ok", "data": { ... } }
 * code === 0 表示成功，其余为业务错误。
 *
 * 如果后端用的是别的包裹结构（比如 { success, result }、或者裸数据），
 * 只需要改 client.ts 里的 unwrap 逻辑 + 这里的 ApiEnvelope，其它代码不用动。
 */
export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  method?: HttpMethod;
  /** 查询参数，undefined / null 会被自动忽略 */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** 请求体，会被 JSON.stringify */
  body?: unknown;
  /** 超时（毫秒），默认 15000 */
  timeout?: number;
  /** 是否自动带上 Authorization 头，默认 true */
  auth?: boolean;
  /** 为 true 时不做统一响应体解包，直接返回原始 JSON */
  raw?: boolean;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
