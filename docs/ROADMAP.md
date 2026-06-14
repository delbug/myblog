# 功能增强路线图

> 参考 [vue3-antdv-admin](https://github.com/buqiyuan/vue3-antdv-admin) 与 [nodejs-koa-blog](https://github.com/lfb/nodejs-koa-blog)

---

## ✅ 第一阶段（已完成）

用户注册登录、Markdown 编辑器、管理后台、图片上传、操作日志等。

---

## ✅ 第二阶段（已完成）

### 后台体验

- [x] 动态表格 `AdminDynamicTable`（搜索 + 分页 + CSV 导出）
- [x] Schema 驱动表单 `AdminSchemaForm`
- [x] 多页签导航 `AdminTabs`
- [x] 面包屑 `AdminBreadcrumb`
- [x] 按钮级权限指令 `v-auth`（SSR 兼容）
- [x] RBAC 权限表（permissions + role_permissions）
- [x] 锁屏 `AdminLockScreen`（30 分钟无操作）
- [x] API 文档页 `/admin/api-docs`（Scalar + OpenAPI）

### 博客功能

- [x] 评论嵌套回复 UI（CommentItem 树形 + @ 回复）
- [x] 登录用户评论（自动关联 userId）
- [x] 文章软删除（deletedAt 回收站 + 恢复 / 永久删除）
- [x] 文章点赞 / 收藏
- [x] 我的收藏页 `/user/favorites`
- [x] 分类层级树 UI（parentId）
- [x] Markdown 文件落盘备份
- [x] 接口限流（登录/注册/评论）
- [x] 全文搜索 API（`/api/search`）

### 工程化

- [x] Prettier 配置
- [x] 单元测试 Vitest
- [x] E2E 测试 Playwright（`npm run test:e2e`）
- [x] OpenAPI 规范（`public/openapi.json`）
- [x] PM2 部署配置
- [x] GitHub Actions CI

### 存储与性能

- [x] 存储抽象（local / aliyun / qiniu / cloudinary）
- [x] Redis 缓存层 + 阅读量缓冲
- [x] ISR + SWR（首页、文章、分类、标签、作者页）
- [x] 热门文章缓存

---

## ✅ 第三阶段（已完成 — v2.1.0）

- [x] **Meilisearch** 全文搜索 + 索引同步 + 后台重建
- [x] **OSS / Cloudinary** 图床完整接入
- [x] **动态菜单** + **角色权限管理 UI**（`/admin/menus`、`/admin/roles`）
- [x] **文章回收站** 恢复 / 永久删除
- [x] **TipTap + Vditor** 双模式编辑器
- [x] **多作者** 前台作者页 + 后台指定作者
- [x] **Google Analytics / 百度统计** 插件 + 后台配置
- [x] **操作日志** 后台页面 `/admin/logs`
- [x] Nuxt **4.x** 升级

---

## 🔮 第四阶段（可选）

- [ ] Elasticsearch 适配层（当前 Meilisearch 已满足多数场景）
- [ ] 邮件通知（评论回复、审核）
- [ ] Webhook / 第三方集成
- [ ] 多语言 i18n
- [ ] 主题 / 皮肤市场
- [ ] 移动端 App 或 PWA 增强

---

## 数据库变更摘要

```bash
npm run db:push
npm run db:seed   # 含权限、菜单种子
```

主要表/字段：

- `permissions` / `role_permissions` — RBAC
- `admin_menus` — 动态后台菜单
- `post_likes` / `post_favorites` — 点赞收藏
- `posts.deleted_at` / `author_id` — 软删除与多作者
- `operation_logs` — 操作审计

---

## 常用命令

```bash
npm run dev              # 开发
npm run build            # 构建
npm run test             # 单元测试
npm run test:e2e         # E2E
npm run search:reindex   # 重建 Meilisearch
npm run db:seed          # 种子数据
npm run pm2:start        # PM2 生产启动
```

---

## 环境变量（完整见 `.env.example`）

```env
# 图床
STORAGE_DRIVER=local       # local | aliyun | qiniu | cloudinary

# 缓存与阅读量
REDIS_URL=redis://...

# 搜索
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=dev-master-key

# 统计
NUXT_PUBLIC_GA_ID=
NUXT_PUBLIC_BAIDU_TONGJI_ID=
```
