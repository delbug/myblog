# Vue + Nuxt 3 + MySQL 个人博客 — 技术规划文档

## 1. 项目概述

本项目是一个支持 **SEO（搜索引擎优化）** 的个人技术博客，参考博客园、掘金等平台的常见功能设计，采用 **Vue 3 + Nuxt 3 + MySQL** 全栈方案，支持服务端渲染（SSR），可直接 Docker 部署。

---

## 2. 功能清单

参考博客园 / 掘金个人博客的常用功能：

| 模块 | 功能 | 说明 |
|------|------|------|
| **文章** | 列表、详情、分页 | 支持最新/热门排序、置顶 |
| **分类** | 按分类浏览 | 如：前端、后端、DevOps |
| **标签** | 标签云、按标签筛选 | 多标签关联 |
| **搜索** | 全文搜索 | 标题 + 正文关键词 |
| **归档** | 按年月归档 | 时间线浏览 |
| **评论** | 访客评论 + 审核 | 防 spam，管理员审核 |
| **关于** | 个人介绍页 | 可配置 |
| **RSS** | `/rss.xml` | 订阅源 |
| **SEO** | Meta、Sitemap、JSON-LD | SSR + 结构化数据 |
| **暗色模式** | 主题切换 | 跟随系统 |
| **管理后台** | 文章 CRUD、评论审核、站点设置 | JWT + HttpOnly Cookie |

---

## 3. 技术栈

### 3.1 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3** | 3.5+ | UI 框架，Composition API |
| **Nuxt 3** | 3.16+ | SSR 框架、路由、API 一体化 |
| **Tailwind CSS** | 3.x | 样式、响应式、暗色模式 |
| **@nuxtjs/color-mode** | - | 明暗主题切换 |
| **@nuxtjs/sitemap** | - | 自动生成 sitemap.xml |

### 3.2 后端（Nuxt Server / Nitro）

| 技术 | 用途 |
|------|------|
| **Nitro** | Nuxt 内置 Node.js 服务端 |
| **Drizzle ORM** | 类型安全的数据库 ORM |
| **mysql2** | MySQL 驱动（连接池） |
| **Zod** | API 请求参数校验 |
| **bcryptjs** | 密码哈希 |
| **jsonwebtoken** | JWT 认证 |
| **markdown-it** | Markdown → HTML 渲染 |
| **highlight.js** | 代码语法高亮 |

### 3.3 数据库

| 技术 | 说明 |
|------|------|
| **MySQL 8.0** | 关系型数据库，utf8mb4 字符集 |

**数据表设计：**

```
users          — 管理员用户
categories     — 文章分类
tags           — 标签
posts          — 文章（Markdown 正文）
post_tags      — 文章-标签多对多
comments       — 评论（支持审核状态）
settings       — 站点配置（键值对）
```

---

## 4. 架构设计

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 / 爬虫                      │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────┐
│              Nuxt 3 (SSR + Nitro Server)              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  Pages/Vue  │  │  Composables│  │ server/api/* │  │
│  │  (SSR HTML) │  │  useSeo等   │  │  REST API    │  │
│  └─────────────┘  └─────────────┘  └──────┬───────┘  │
└───────────────────────────────────────────┼──────────┘
                                            │ Drizzle ORM
┌───────────────────────────────────────────▼──────────┐
│                     MySQL 8.0                          │
└────────────────────────────────────────────────────────┘
```

### 4.1 SEO 策略

1. **SSR**：所有公开页面服务端渲染，HTML 含完整内容
2. **useSeoMeta**：每页独立 title / description / og 标签
3. **JSON-LD**：文章页注入 `BlogPosting` 结构化数据
4. **Canonical URL**：防止重复内容
5. **Sitemap**：动态包含所有已发布文章
6. **RSS**：`/rss.xml` 供订阅
7. **语义化 HTML**：article、h1-h6、nav 等

### 4.2 认证方案

- 管理员登录 → 服务端验证 → 签发 JWT → 写入 **HttpOnly Cookie**
- 管理 API 通过 `requireAuth()` 中间件校验
- 前端 `/admin/*` 路由通过 `admin-auth` 中间件守卫

---

## 5. 目录结构

```
demo-vuessr/
├── assets/css/           # 全局样式
├── components/           # Vue 组件
├── composables/          # 组合式函数（useSeo 等）
├── layouts/              # 布局（default / admin）
├── middleware/           # 路由中间件
├── pages/                # 页面（文件路由）
│   ├── index.vue         # 首页
│   ├── posts/[slug].vue  # 文章详情
│   ├── categories/       # 分类页
│   ├── tags/             # 标签页
│   ├── search.vue        # 搜索
│   ├── archive.vue       # 归档
│   ├── about.vue         # 关于
│   └── admin/            # 管理后台
├── server/
│   ├── api/              # REST API
│   ├── database/         # Schema + 连接 + Seed
│   ├── routes/           # 自定义路由（RSS）
│   └── utils/            # 工具函数
├── docker/               # Docker 配置
├── docs/                 # 文档
├── scripts/              # 部署脚本
├── nuxt.config.ts
├── docker-compose.yml
└── Dockerfile
```

---

## 6. API 接口一览

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/posts` | 文章列表 | 公开 |
| GET | `/api/posts/:slug` | 文章详情 | 公开 |
| GET | `/api/categories` | 分类列表 | 公开 |
| POST | `/api/categories` | 创建分类 | 管理员 |
| GET | `/api/tags` | 标签列表 | 公开 |
| POST | `/api/tags` | 创建标签 | 管理员 |
| GET | `/api/comments?postId=` | 评论列表 | 公开 |
| POST | `/api/comments` | 提交评论 | 公开 |
| GET | `/api/archive` | 归档数据 | 公开 |
| GET | `/api/settings` | 站点配置 | 公开 |
| PUT | `/api/settings` | 更新配置 | 管理员 |
| POST | `/api/auth/login` | 登录 | 公开 |
| POST | `/api/auth/logout` | 退出 | 公开 |
| GET | `/api/auth/me` | 当前用户 | 公开 |
| GET/POST | `/api/admin/posts` | 文章管理 | 管理员 |
| GET/PUT/DELETE | `/api/admin/posts/:id` | 单篇管理 | 管理员 |
| GET | `/api/admin/comments` | 评论管理 | 管理员 |
| PUT/DELETE | `/api/admin/comments/:id` | 审核/删除 | 管理员 |
| GET | `/rss.xml` | RSS 订阅 | 公开 |
| GET | `/sitemap.xml` | 站点地图 | 公开 |

---

## 7. 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NUXT_PUBLIC_SITE_URL` | 站点 URL | `http://localhost:3000` |
| `NUXT_PUBLIC_SITE_NAME` | 站点名称 | `My Blog` |
| `NUXT_PUBLIC_SITE_DESCRIPTION` | 站点描述 | - |
| `JWT_SECRET` | JWT 密钥 | （务必修改） |
| `DB_HOST` | MySQL 主机 | `localhost` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `DB_USER` | 数据库用户 | `blog` |
| `DB_PASSWORD` | 数据库密码 | `blog123` |
| `DB_NAME` | 数据库名 | `blog_db` |

---

## 8. 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env

# 3. 启动 MySQL（Docker）
docker compose up mysql -d

# 4. 推送表结构 + 种子数据
npm run db:push
npm run db:seed

# 5. 启动开发服务器
npm run dev
```

访问：
- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login（admin / admin123）

---

## 9. 后续扩展建议

- [ ] 图片上传（封面图、文中图片）→ 接入 OSS / Cloudinary
- [ ] Markdown 编辑器增强 → TipTap / Vditor
- [ ] 评论回复嵌套展示
- [ ] 阅读量 Redis 缓存
- [ ] 全文搜索 → Elasticsearch / Meilisearch
- [ ] 多用户 / 多作者
- [ ] ISR 静态增量渲染（高流量文章页）
- [ ] 接入 Google Analytics / 百度统计
