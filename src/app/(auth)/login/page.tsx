import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { apiMode } from "@/lib/api";

export const metadata: Metadata = {
  title: "登录 · Workflow",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">登录</h1>
        <p className="text-sm text-muted-foreground">用邮箱和密码继续你的工作</p>
      </div>

      <LoginForm />

      <p className="text-sm text-muted-foreground">
        还没有账号？
        <Link
          href="/register"
          className="ml-1 font-medium text-foreground underline underline-offset-4 hover:text-foreground/70"
        >
          立即注册
        </Link>
      </p>

      {apiMode === "mock" && (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          当前是本地假数据模式，可用演示账号登录：
          <div className="mt-1 flex items-center gap-2 font-mono text-foreground">
            <span>demo@example.com</span>
            <span className="text-muted-foreground/60">/</span>
            <span>123456</span>
          </div>
        </div>
      )}
    </div>
  );
}
