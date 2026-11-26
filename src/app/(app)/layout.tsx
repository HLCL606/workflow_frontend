import { RequireAuth } from "@/components/auth/require-auth";

/** 登录后才能进的区域，统一在这里加守卫 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <RequireAuth>
      <div className="flex min-h-svh flex-col">{children}</div>
    </RequireAuth>
  );
}
