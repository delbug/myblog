# Vue + Nuxt 4 + MySQL 个人博客 — 技术规划文档

## 1. 项目概述

本项目是一个支持 **SEO** 的个人技术博客，参考博客园、掘金等平台设计，采用 **Vue 3 + Nuxt 4 + MySQL** 全栈方案，支持 SSR、ISR、可选 Redis / Meilisearch，可 Docker 部署。

**版本：** 2.1.0

---

## 2. 功能清单

| 模块 | 功能 | 说明 |
|------|------|------|
| **文章** | 列表、详情、分页、置顶 | 最新/热门排序、ISR 缓存 |
| **写作** | Vditor + TipTap | Markdown 存储、富文本可选 |
| **分类 / 标签** | 浏览 + 后台 CRUD | 层级分类 |
| **搜索** | Meilisearch / MySQL | `/api/search`，可重建索引 |
| **作者** | 多作者页 | `/authors/:username` |
| **归档** | 按年月 | 时间线 |
| **评论** | 嵌套回复 + 审核 | 限流防刷 |
| **互动** | 点赞、收藏 | 需登录 |
| **回收站** | 软删除、恢复、永久删 | 同步搜索索引 |
| **RSS / Sitemap** | 订阅与抓取 | 动态 URL |
| **SEO** | Meta、JSON-LD、SSR | `usePageSeo` |
| **统计** | GA、百度统计 | 后台或 .env 配置 |
| **后台** | RBAC、动态菜单、操作日志 | Scalar API 文档 |
| **图床** | local / OSS / 七牛 / Cloudinary | `storage.ts` 抽象 |

---

## 3. 技术栈

### 3.1 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5+ | UI，Composition API |
| Nuxt | 4.x | SSR、路由、API 一体化 |
| Tailwind CSS | 3.x | 样式、暗色模式 |
| TipTap | 3.x | 富文本编辑器 |
| Vditor | 3.x | Markdown 编辑器 |
| @nuxtjs/color-mode | - | 主题切换 |
| @nuxtjs/sitemap | - | sitemap.xml |

### 3.2 后端（Nitro）

| 技术 | 用途 |
|------|------|
| Drizzle ORM | 类型安全 SQL |
| mysql2 | MySQL 连接池 |
| Zod 4 | 请求校验 |
| bcryptjs / jsonwebtoken | 密码与 JWT Cookie |
| markdown-it / highlight.js | 正文渲染 |
| meilisearch | 全文搜索（可选） |
| ioredis | 缓存、阅读量（可选） |
| ali-oss / qiniu / cloudinary | 对象存储 |

### 3.3 测试与工具

| 技术 | 用途 |
|------|------|
| Vitest | 单元测试 |
| Playwright | E2E |
| Scalar | API 文档 UI |
| PM2 | 生产进程 |

---

## 4. 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   浏览器 / 爬虫 / RSS                    │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP
┌─────────────────────────▼───────────────────────────────┐
│              Nuxt 4 (SSR + ISR + Nitro)                  │
│  pages/components  │  server/api  │  server/utils       │
└─────────┬──────────────────┬─────────────────┬──────────┘
          │                  │                 │
          ▼                  ▼                 ▼
      MySQL 8.0      Meilisearch(可选)   Redis(可选)
```

### 4.1 SEO 策略

1. SSR + ISR/SWR（`routeRules`）
2. 每页 `usePageSeo`（Meta、OG、JSON-LD）
3. Canonical、Sitemap、RSS
4. 语义化 HTML

### 4.2 认证与权限

- JWT → HttpOnly Cookie `blog_token`
- `requireAuth` / `requireAdmin` / `requirePermission`
- 前台 `useAuth` + 后台 `admin-auth` 中间件
- `v-auth` 按钮级 UI 权限

---

## 5. 目录结构

```
demo-vuessr/
├── pages/              # 文件路由
├── components/         # UI 组件（ArticleEditor、ImageUpload…）
├── composables/        # useAuth、useAdminMenu…
├── layouts/            # default / admin
├── middleware/         # admin-auth
├── plugins/            # auth-directive、analytics
├── server/
│   ├── api/            # REST
│   ├── database/       # schema、seed
│   ├── utils/          # post、storage、meilisearch、viewCount…
│   └── scripts/        # reindex-meili
├── e2e/                # Playwright
├── docs/               # 文档
└── nuxt.config.ts
```

---

## 6. API 接口一览

### 公开

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 文章列表 |
| GET | `/api/posts/:slug` | 文章详情（阅读量+1） |
| GET | `/api/search` | 全文搜索 |
| GET | `/api/authors` | 作者列表 |
| GET | `/api/authors/:username` | 作者详情+文章 |
| GET | `/api/categories` | 分类 |
| GET | `/api/tags` | 标签 |
| GET | `/api/comments` | 评论 |
| POST | `/api/comments` | 提交评论 |
| GET | `/api/archive` | 归档 |
| GET | `/api/settings` | 站点配置 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/logout` | 退出 |
| GET | `/api/auth/me` | 当前用户 |
| GET | `/api/auth/permissions` | 权限码 |
| POST | `/api/upload/image` | 图片上传 |
| POST | `/api/posts/:id/like` | 点赞 |
| POST | `/api/posts/:id/favorite` | 收藏 |
| GET | `/api/user/favorites` | 收藏列表 |
| GET | `/rss.xml` | RSS |

### 管理（需 admin + 权限码）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/admin/posts` | 文章 CRUD |
| GET/PUT/DELETE | `/api/admin/posts/:id` | 单篇 |
| GET | `/api/admin/posts/trash` | 回收站 |
| POST | `/api/admin/posts/:id/restore` | 恢复 |
| DELETE | `/api/admin/posts/:id/permanent` | 永久删除 |
| GET/PUT | `/api/admin/comments/:id` | 评论审核 |
| GET | `/api/admin/users` | 用户 |
| GET/PUT | `/api/admin/roles` | 角色权限 |
| GET/POST/PUT/DELETE | `/api/admin/menus/manage` | 菜单 |
| GET | `/api/admin/logs` | 操作日志 |
| POST | `/api/admin/search/reindex` | 重建搜索索引 |
| PUT | `/api/settings` | 站点设置 |

完整 OpenAPI：`public/openapi.json`

---

## 7. 环境变量

| 变量 | 说明 |
|------|------|
| `NUXT_PUBLIC_SITE_*` | 站点名、URL、描述 |
| `JWT_SECRET` | JWT 密钥（生产必改） |
| `DB_*` | MySQL |
| `REDIS_URL` | 可选 |
| `MEILISEARCH_HOST` / `MEILISEARCH_API_KEY` | 可选 |
| `STORAGE_DRIVER` | local / aliyun / qiniu / cloudinary |
| `NUXT_PUBLIC_GA_ID` / `NUXT_PUBLIC_BAIDU_TONGJI_ID` | 统计 |

详见 `.env.example`。

---

## 8. 本地开发

```bash
npm install
cp .env.example .env
brew services start mysql    # 或 docker compose up mysql -d
npm run db:push && npm run db:seed
npm run dev
```

可选：

```bash
docker compose up meilisearch -d
npm run search:reindex
```

| 地址 | 账号 |
|------|------|
| http://localhost:3000 | — |
| http://localhost:3000/admin/login | admin / admin123 |

---

## 9. 相关文档

| 文档 | 内容 |
|------|------|
| [ONBOARDING.md](./ONBOARDING.md) | 新人读代码指南 |
| [TUTORIAL.md](./TUTORIAL.md) | 使用教程 |
| [STARTUP.md](./STARTUP.md) | 启动命令 |
| [ROADMAP.md](./ROADMAP.md) | 功能路线图 |
| [DEPLOY.md](./DEPLOY.md) | 部署 |

---

## 10. 后续扩展

见 [ROADMAP.md](./ROADMAP.md) 第四阶段（Elasticsearch 适配、邮件通知、i18n 等）。
