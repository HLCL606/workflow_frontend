import { ShieldCheck, Sparkles, Zap } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "开箱即用的请求层",
    description: "统一响应体、超时、错误归一、401 兜底，接口换成真实后端只用改一个环境变量。",
  },
  {
    icon: ShieldCheck,
    title: "登录态集中管理",
    description: "token 存取与路由守卫都收敛在 AuthProvider，页面不关心存储细节。",
  },
  {
    icon: Sparkles,
    title: "界面按 shadcn 规范来",
    description: "组件来自 components/ui，改样式改主题变量即可，不需要和业务代码纠缠。",
  },
];

/** 登录 / 注册页左侧的品牌区，移动端隐藏 */
export function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-neutral-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 size-[32rem] rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-indigo-500/20 blur-3xl"
      />

      <div className="relative flex items-center gap-2.5 text-white">
        <div className="flex size-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-neutral-950">
          W
        </div>
        <span className="text-lg font-semibold tracking-tight">Workflow</span>
      </div>

      <div className="relative max-w-md">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-white">
          把一件事，
          <br />
          从头跟到尾。
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          登录 / 注册模块的前端骨架。现在跑在本地假数据上，后端就绪后只换实现，不动页面。
        </p>

        <ul className="mt-10 flex flex-col gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3.5">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-400">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-neutral-500">
        © 2026 Workflow. All rights reserved.
      </p>
    </div>
  );
}
