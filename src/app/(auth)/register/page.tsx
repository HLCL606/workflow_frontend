import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "注册 · Workflow",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">创建账号</h1>
        <p className="text-sm text-muted-foreground">30 秒完成注册，马上开始使用</p>
      </div>

      <RegisterForm />

      <p className="text-sm text-muted-foreground">
        已经有账号了？
        <Link
          href="/login"
          className="ml-1 font-medium text-foreground underline underline-offset-4 hover:text-foreground/70"
        >
          直接登录
        </Link>
      </p>
    </div>
  );
}
