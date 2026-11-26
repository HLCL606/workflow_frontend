"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type LoginPayload, type RegisterPayload, type User } from "@/lib/api";
import { onUnauthorized } from "@/lib/http/client";
import { tokenStorage } from "./token";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (payload: LoginPayload, options?: { remember?: boolean }) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // 首次进入：本地有 token 就拿它换一次用户信息，恢复登录态
  useEffect(() => {
    if (!tokenStorage.get()) {
      setStatus("unauthenticated");
      return;
    }

    let cancelled = false;
    authApi
      .me()
      .then((profile) => {
        if (cancelled) return;
        setUser(profile);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // 任何请求返回 401，统一清登录态并踢回登录页
  useEffect(
    () =>
      onUnauthorized(() => {
        clearSession();
        router.replace("/login");
      }),
    [clearSession, router]
  );

  const login = useCallback(async (payload: LoginPayload, options?: { remember?: boolean }) => {
    const session = await authApi.login(payload);
    tokenStorage.set(session.token, options?.remember ?? true);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await authApi.register(payload);
    tokenStorage.set(session.token, true);
    setUser(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 退出接口失败也照样清本地登录态，不阻塞用户
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  }
  return context;
}
