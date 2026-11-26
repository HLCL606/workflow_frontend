"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/context";

/** 登录后的落地页，只是用来验证登录态，后面换成真实业务页 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function handleLogout() {
    setLeaving(true);
    await logout();
    router.replace("/login");
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b px-5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-neutral-950 text-xs font-semibold text-white">
            W
          </div>
          <span className="text-sm font-semibold tracking-tight">Workflow</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout} disabled={leaving}>
            {leaving ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <LogOut className="size-3.5" />
            )}
            退出登录
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>登录成功</CardTitle>
            <CardDescription>
              这里之后换成真实业务页面。当前页面只用来确认整个登录链路是通的。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Row label="昵称" value={user?.name ?? "-"} />
            <Row label="邮箱" value={user?.email ?? "-"} />
            <Row label="用户 ID" value={user?.id ?? "-"} />
            <Row
              label="注册时间"
              value={
                user ? new Date(user.createdAt).toLocaleString("zh-CN", { hour12: false }) : "-"
              }
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}
