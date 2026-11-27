# 协作说明

本仓库用两条长期分支对应两套环境，日常改动通过 Pull Request（PR）合入。

## 分支

| 分支 | 环境 | 说明 |
| --- | --- | --- |
| `prod` | 正式服 | 线上稳定代码，默认分支 |
| `staging` | 测试服 | 联调与验收 |
| `feature/<名字>-<简述>` | 本地开发 | 个人短生命周期分支 |

示例：`feature/leon-login-remember`

## 日常流程

1. 从最新 `staging` 拉出自己的功能分支：

   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/你的名字-功能简述
   ```

2. 本地开发、提交，推到远程：

   ```bash
   git add .
   git commit -m "feat: 简短说明"
   git push -u origin HEAD
   ```

3. 在 GitHub 上对 **`staging`** 开 PR，至少 1 人 Review 通过后再合并。
4. 测试服验证通过后，再开 PR：`staging` → **`prod`**，合入后部署正式服。

**禁止**直接向 `prod` / `staging` 执行 `git push`，一律走 PR。

## 合并方式

合入 `staging` / `prod` 时优先使用 **Squash and merge**（把该 PR 的多次提交压成一条），保持主分支历史清晰。

## 提交说明（建议）

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `chore:` 构建 / 依赖 / 杂项

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

详见 [README.md](./README.md)。

## 紧急修复（hotfix）

线上问题从 `prod` 拉分支：

```bash
git checkout prod
git pull origin prod
git checkout -b hotfix/问题简述
```

修好后：

1. PR 合入 `prod` 并部署正式服
2. 再把同一改动合入 `staging`，避免测试服落后
