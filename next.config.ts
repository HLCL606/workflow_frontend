import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 说明：模板默认开启了 cacheComponents / partialPrefetching。
  // 这两项会把「靠客户端守卫的受保护页面」判定为无法预渲染，并在 dev 下持续刷
  // instant-navigation 报错（页面本身能正常访问）。登录骨架用不上 PPR，
  // 先保持关闭；等以后改成服务端 cookie 鉴权、确实需要 PPR 时再打开。
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
