# Workflow Frontend

只有登录 / 注册模块的前端骨架：**Next.js 16（App Router）+ Tailwind CSS 4 + shadcn/ui**。
后端还没写，接口层已经按「契约 → 实现」拆好，现在跑本地假数据，接口就绪后换一个环境变量即可切换。

## 快速开始

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev                  # http://localhost:3000
```

演示账号：`demo@example.com` / `123456`（注册的新账号也会存进 localStorage，刷新后还能登录）

## 页面

| 路由 | 说明 |
| --- | --- |
| `/login` | 登录，含「记住我」（勾选存 localStorage，不勾存 sessionStorage） |
| `/register` | 注册，成功后自动登录并跳到 `/dashboard` |
| `/dashboard` | 受保护页占位，用来验证登录链路（可替换成真实业务页） |
| `/` | 重定向到 `/dashboard`，未登录会被守卫送回 `/login` |

## 目录结构

```
src/
├─ app/
│  ├─ (auth)/                 # 登录注册分组，共用一个左右分栏布局
│  │  ├─ layout.tsx
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  ├─ (app)/                  # 需要登录才能进的分组
│  │  ├─ layout.tsx           # 统一套 <RequireAuth>
│  │  └─ dashboard/page.tsx
│  ├─ layout.tsx              # 挂 AuthProvider + Toaster
│  └─ page.tsx
├─ components/
│  ├─ ui/                     # shadcn 组件，改样式改这里
│  ├─ auth/                   # 登录/注册表单、密码框、路由守卫
│  └─ layout/                 # 登录页左侧品牌区
└─ lib/
   ├─ http/                   # 请求层：client / errors / types
   ├─ api/                    # 接口契约 + http 实现 + mock 实现 + 出口
   ├─ auth/                   # token 存取 + AuthProvider（登录态）
   └─ validators/auth.ts      # 表单校验规则（零依赖）
```

## 请求层是怎么设计的

调用链只有一条：**页面 → `lib/api`（契约）→ mock 或 http（实现）→ fetch**。

1. `lib/api/auth.ts` 定义 `AuthApi` 接口和 `User` / `AuthSession` 等模型。
   页面和 `AuthProvider` 只依赖这个 `interface`，不关心底下是谁在实现。

2. `lib/api/index.ts` 按环境变量选出实现，页面里只 `import { authApi }`：

   ```ts
   export const authApi: AuthApi = apiMode === "http" ? httpAuthApi : mockAuthApi;
   ```

3. `lib/http/client.ts` 是唯一的请求出口，负责：
   - 拼 baseURL + query 参数、自动 `JSON.stringify`
   - 自动带 `Authorization: Bearer <token>`
   - `AbortController` 超时（默认 15s）
   - 解包统一响应体 `{ code, message, data }`，`code !== 0` 抛错
   - 把 HTTP 错误 / 业务错误 / 网络错误 / 超时统一成 `ApiError`
   - 401 触发全局回调，`AuthProvider` 收到后清登录态并跳登录页

4. 错误提示只需要 `getErrorMessage(error)`，不用判断错误类型。

### 统一响应体约定

```json
{ "code": 0, "message": "ok", "data": { } }
```

`code === 0` 为成功。如果后端用别的结构（`{ success, result }`、或者裸数据），
只改 `client.ts` 里解包那一段和 `types.ts` 的 `ApiEnvelope`，其余代码不动。

## 换成真实后端

1. 改 `.env.local`：

   ```bash
   NEXT_PUBLIC_API_MODE=http
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

2. 后端按下面四个接口实现（响应体遵循上面的约定）：

   | 方法 | 路径 | 请求体 | data |
   | --- | --- | --- | --- |
   | POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
   | POST | `/auth/register` | `{ name, email, password }` | `{ token, user }` |
   | GET | `/auth/me` | - | `User` |
   | POST | `/auth/logout` | - | `null` |

3. 页面代码一行都不用改。

### 如果后端改用 httpOnly Cookie

- `lib/auth/token.ts` 三个方法改成空实现（请求已经带 `credentials: "include"`）
- 路由守卫从客户端的 `<RequireAuth>` 换成 `middleware.ts` 读 cookie，安全性更好
- 那时也可以把 `next.config.ts` 里关掉的 `cacheComponents` 重新打开

## 表单校验

规则集中在 `lib/validators/auth.ts`（不引第三方校验库），返回 `{ 字段: 提示文案 }`，
登录和注册表单共用同一套规则与文案。字段错误直接显示在输入框下面，服务端错误显示在表单顶部。

## 其他

- `testdata/verify-auth-flow.mjs`：用无头 Chrome 跑一遍「守卫跳转 → 密码错误 → 登录 → 刷新保持 → 退出 → 注册 → 重复邮箱 → 空表单校验」的临时验证脚本，不属于构建产物。

  ```bash
  npm run dev                 # 先起服务
  node testdata/verify-auth-flow.mjs
  ```

- `next.config.ts` 里关掉了模板默认的 `cacheComponents` / `partialPrefetching`：它们会把客户端守卫的受保护页面判定为无法预渲染，dev 下持续刷 `instant-navigation` 报错。登录骨架用不上 PPR，先保持关闭。
