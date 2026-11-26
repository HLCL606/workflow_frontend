import type { AuthApi, AuthSession, LoginPayload, RegisterPayload, User } from "../auth";
import { tokenStorage } from "@/lib/auth/token";
import { ApiError } from "@/lib/http/errors";

/**
 * 后端还没写时的假实现。
 *
 * 行为尽量贴近真实后端：有延时、会校验密码、重复邮箱报 409、token 失效报 401。
 * 账号存在 localStorage，刷新页面后注册过的用户仍然可以登录。
 *
 * 想验证错误提示，直接用内置账号：
 *   邮箱 demo@example.com / 密码 123456
 */

const DB_KEY = "wf.mock.users";
const LATENCY = 600;

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

const SEED: StoredUser[] = [
  {
    id: "u_demo",
    name: "演示用户",
    email: "demo@example.com",
    password: "123456",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

function delay(ms = LATENCY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readDb(): StoredUser[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? [...SEED, ...parsed] : SEED;
  } catch {
    return SEED;
  }
}

function findUser(email: string) {
  const target = email.trim().toLowerCase();
  return readDb().find((item) => item.email.toLowerCase() === target);
}

function saveUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(DB_KEY);
  const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : [];
  window.localStorage.setItem(DB_KEY, JSON.stringify([...parsed, user]));
}

function toUser({ id, name, email, createdAt }: StoredUser): User {
  return { id, name, email, createdAt };
}

/** token 里塞用户 id，me() 时再解出来 */
function issueToken(userId: string) {
  return `mock.${userId}.${Date.now()}`;
}

function tokenToUserId(token: string) {
  const [prefix, userId] = token.split(".");
  return prefix === "mock" && userId ? userId : null;
}

const unauthorized = () => new ApiError("登录已过期，请重新登录", { code: 401, status: 401 });

export const mockAuthApi: AuthApi = {
  async login({ email, password }: LoginPayload): Promise<AuthSession> {
    await delay();

    const user = findUser(email);
    if (!user || user.password !== password) {
      // 故意不区分「用户不存在」和「密码错误」，避免账号探测
      throw new ApiError("邮箱或密码不正确", { code: 401, status: 401 });
    }

    return { token: issueToken(user.id), user: toUser(user) };
  },

  async register({ name, email, password }: RegisterPayload): Promise<AuthSession> {
    await delay();

    if (findUser(email)) {
      throw new ApiError("该邮箱已被注册", { code: 409, status: 409 });
    }

    const user: StoredUser = {
      id: `u_${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };
    saveUser(user);

    return { token: issueToken(user.id), user: toUser(user) };
  },

  async me(): Promise<User> {
    await delay(200);

    const token = tokenStorage.get();
    const userId = token ? tokenToUserId(token) : null;
    if (!userId) throw unauthorized();

    const user = readDb().find((item) => item.id === userId);
    if (!user) throw unauthorized();

    return toUser(user);
  },

  async logout(): Promise<void> {
    await delay(150);
  },
};
