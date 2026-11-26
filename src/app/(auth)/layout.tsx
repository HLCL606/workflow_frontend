import { BrandPanel } from "@/components/layout/brand-panel";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <BrandPanel />

      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-950 text-xs font-semibold text-white">
            W
          </div>
          <span className="text-base font-semibold tracking-tight">Workflow</span>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[360px]">{children}</div>
        </div>

        <p className="text-center text-xs text-muted-foreground lg:text-left">
          登录即表示同意我们的服务条款与隐私政策
        </p>
      </div>
    </div>
  );
}
