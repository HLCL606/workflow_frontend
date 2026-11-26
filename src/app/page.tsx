import { redirect } from "next/navigation";

/** 首页先直接进受保护区域，没登录会被守卫送去 /login */
export default function HomePage() {
  redirect("/dashboard");
}
