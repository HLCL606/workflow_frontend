"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

/**
 * 受保护页面的守卫。登录态未知时先显示 loading，
 * 确认未登录则跳登录页，避免先闪一下内容再跳走。
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "authenticated") return <>{children}</>;

  return (
    <div className="flex min-h-svh items-center justify-center">
      <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
