/**
 * accessToken 的存放位置。
 *
 * 目前后端还没写，先把 token 放在浏览器里最省事的一处：
 *   - 勾选「记住我」→ localStorage（关掉浏览器也还在）
 *   - 没勾 → sessionStorage（关掉标签页就没了）
 *
 * 将来后端下发 httpOnly Cookie 之后，这个文件里的三个方法都改成空实现，
 * 请求带上 credentials 就够了，其它代码不用动。
 */
const KEY = "wf.access_token";

function hasWindow() {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  get(): string | null {
    if (!hasWindow()) return null;
    return window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY);
  },

  set(token: string, persist = true) {
    if (!hasWindow()) return;
    this.clear();
    const store = persist ? window.localStorage : window.sessionStorage;
    store.setItem(KEY, token);
  },

  clear() {
    if (!hasWindow()) return;
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(KEY);
  },
};
