# 功能增强路线图

> 参考 [vue3-antdv-admin](https://github.com/buqiyuan/vue3-antdv-admin) 与 [nodejs-koa-blog](https://github.com/lfb/nodejs-koa-blog)

---

## ✅ 第一阶段（已完成）

用户注册登录、Markdown 编辑器、管理后台、图片上传、操作日志等 — 详见 git history。

---

## ✅ 第二阶段（已完成）

### 后台体验（vue3-antdv-admin）
- [x] 动态表格 `AdminDynamicTable`（搜索 + 分页 + CSV 导出）
- [x] Schema 驱动表单 `AdminSchemaForm`
- [x] 多页签导航 `AdminTabs`
- [x] 面包屑 `AdminBreadcrumb`
- [x] 按钮级权限指令 `v-auth`
- [x] RBAC 权限表（permissions + role_permissions）
- [x] 锁屏 `AdminLockScreen`（30 分钟无操作）
- [x] API 文档页 `/admin/api-docs`

### 博客功能（nodejs-koa-blog）
- [x] 评论嵌套回复 UI（CommentItem 树形）
- [x] 登录用户评论（自动关联 userId）
- [x] 文章软删除（deletedAt 回收站）
- [x] 文章点赞 / 收藏（post_likes + post_favorites）
- [x] 我的收藏页 `/user/favorites`
- [x] 分类层级树 UI（parentId）
- [x] Markdown 文件落盘备份（storage/articles/）
- [x] 接口限流（登录/注册/评论）
- [x] 全文搜索 API（`/api/search`，MySQL LIKE）

### 工程化
- [x] ESLint + Prettier 配置
- [x] 单元测试 Vitest（`tests/utils.test.ts`）
- [x] OpenAPI 规范（`public/openapi.json`）
- [x] PM2 部署配置（`ecosystem.config.cjs`）
- [x] GitHub Actions CI（`.github/workflows/ci.yml`）

### 存储与性能
- [x] 存储抽象（local / oss 预留，`server/utils/storage.ts`）
- [x] Redis 缓存层（可选，无 Redis 时内存降级）
- [x] ISR 增量渲染（首页 10min、文章页 1h）
- [x] 热门文章 Redis/内存缓存

---

## 🚧 第三阶段（可选扩展）

- [ ] Meilisearch 全文搜索引擎
- [ ] 完整 OSS SDK 接入（阿里云/七牛）
- [ ] 动态菜单 + 角色管理 UI
- [ ] 文章回收站恢复功能
- [ ] Markdown 编辑器升级（TipTap / Vditor）
- [ ] E2E 测试（Playwright）
- [ ] Swagger UI 可视化（Scalar 嵌入）

---

## 数据库变更（第二阶段）

```bash
npm run db:push
npm run db:seed   # 含权限种子数据
```

新增表/字段：
- `permissions` / `role_permissions` — RBAC
- `post_likes` / `post_favorites` — 点赞收藏
- `posts.deleted_at` / `like_count` / `favorite_count` — 软删除与计数

---

## 常用命令

```bash
npm run dev          # 开发
npm run build        # 构建
npm run test         # 单元测试
npm run db:seed      # 种子数据（含权限）
npm run pm2:start    # PM2 生产启动
```

---

## 环境变量（新增）

```env
STORAGE_DRIVER=local       # local | oss
REDIS_URL=redis://...      # 可选
OSS_REGION=                # OSS 预留
OSS_BUCKET=
OSS_ACCESS_KEY=
OSS_SECRET_KEY=
```
