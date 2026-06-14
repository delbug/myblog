# 新人上手指南 — 如何看懂这个项目

> 本文档面向 **前端新人**：假设你已经会 HTML / CSS / JavaScript 基础，可能接触过 Vue，但还不熟悉 Nuxt 全栈项目。  
> 读完后你应该能回答：**这个项目有哪些功能？每个功能对应哪些文件？数据是怎么流动的？**

---

## 1. 这个项目是什么？

这是一个 **个人技术博客**，类似博客园 / 掘金个人主页，特点是：

- **前台**：访客浏览文章、搜索、评论、注册登录
- **后台**：管理员写文章、审评论、管分类标签、改站点设置
- **SEO 友好**：页面在服务端渲染（SSR），搜索引擎能直接读到完整 HTML

技术上，它不是一个「纯前端 + 独立后端」的两套项目，而是 **Nuxt 全栈**：  
**页面（Vue）和接口（API）都在同一个仓库里**，由 Nuxt 统一启动。

```
浏览器访问 /posts/hello-world
        │
        ▼
┌───────────────────────────────────────┐
│  Nuxt 4                               │
│  ┌─────────────┐    ┌──────────────┐  │
│  │ pages/*.vue │───▶│ server/api/* │  │
│  │ （页面 UI）  │    │ （REST 接口） │  │
│  └─────────────┘    └──────┬───────┘  │
└────────────────────────────┼──────────┘
                             ▼
                        MySQL 数据库
```

---

## 2. 建议的阅读顺序

按下面顺序看代码，比从根目录乱翻效率高：

| 顺序 | 看什么 | 目的 |
|------|--------|------|
| 1 | 本文档 | 建立整体地图 |
| 2 | `package.json` | 用了哪些库 |
| 3 | `nuxt.config.ts` | 全局配置（SSR、模块、环境变量） |
| 4 | `app.vue` → `layouts/default.vue` | 页面外壳怎么包起来 |
| 5 | `pages/index.vue` | 最典型的「页面 + 调接口」写法 |
| 6 | `server/api/posts/index.get.ts` | 最典型的 API 写法 |
| 7 | `server/database/schema.ts` | 数据库表长什么样 |
| 8 | `composables/useAuth.ts` | 登录状态怎么全局共享 |
| 9 | 按需深入某个功能对应的 `pages/` + `server/api/` | 改具体功能 |

本地跑起来：见 [STARTUP.md](./STARTUP.md)。

---

## 3. 技术栈说明（每个是什么、在本项目干什么）

### 3.1 核心框架

| 技术 | 版本 | 是什么 | 在本项目里干什么 |
|------|------|--------|------------------|
| **Nuxt** | 4.x | 基于 Vue 的全栈框架 | 文件路由、SSR、API 路由、构建部署一条龙 |
| **Vue 3** | 3.5+ | 前端 UI 框架 | 所有 `.vue` 页面和组件，用 Composition API（`ref`、`computed`、`setup`） |
| **Nitro** | Nuxt 内置 | Node.js 服务端引擎 | 运行 `server/` 下的 API，生产环境打包成 `.output/server` |
| **TypeScript** | 6.x | 带类型的 JavaScript | 全项目 `.ts` / `.vue`，减少拼写和类型错误 |

**新人要点**：在 Nuxt 里，你写页面不用配路由表——`pages/about.vue` 自动对应 `/about`。

### 3.2 样式与 UI

| 技术 | 是什么 | 在本项目干什么 |
|------|--------|------------------|
| **Tailwind CSS** | 原子化 CSS 工具类 | 写 `class="flex gap-4 text-primary-600"` 这种样式，见 `assets/css/main.css` |
| **@tailwindcss/typography** | 文章排版插件 | `.prose-blog` 类渲染 Markdown 正文 |
| **@nuxtjs/color-mode** | 明暗主题模块 | 顶栏 🌙/☀️ 切换，`AppHeader.vue` 里 `useColorMode()` |

全局样式约定（按钮、输入框等）定义在 `assets/css/main.css`：

- `.btn-primary` / `.btn-secondary` — 按钮
- `.input` — 输入框
- `.card` — 卡片容器
- `.prose-blog` — 文章正文区域

### 3.3 数据与后端

| 技术 | 是什么 | 在本项目干什么 |
|------|--------|------------------|
| **MySQL** | 关系型数据库 | 存用户、文章、评论、分类、标签等 |
| **Drizzle ORM** | TypeScript ORM | `server/database/schema.ts` 定义表结构，API 里用类型安全的查询 |
| **mysql2** | MySQL 驱动 | Drizzle 底层连接数据库 |
| **Zod** | 4.x 数据校验库 | API 收到请求体后校验格式；错误信息用 `zodFirstError()` |
| **bcryptjs** | 密码加密 | 注册时哈希密码，登录时比对 |
| **jsonwebtoken (JWT)** | 令牌 | 登录成功后签发 token，写入 HttpOnly Cookie |

### 3.4 内容与 SEO

| 技术 | 是什么 | 在本项目干什么 |
|------|--------|------------------|
| **markdown-it** | Markdown 解析 | 文章正文 Markdown → HTML |
| **highlight.js** | 代码高亮 | 文章和编辑器里的代码块着色 |
| **@nuxtjs/sitemap** | 站点地图模块 | 自动生成 `/sitemap.xml`，动态文章 URL 来自 `/api/__sitemap__/urls` |
| **usePageSeo**（自研 composable） | SEO 封装 | 设置 title、description、Open Graph、JSON-LD |

### 3.5 工具与其他

| 技术 | 是什么 | 在本项目干什么 |
|------|--------|------------------|
| **@vueuse/core** | Vue 工具集 | 部分组件可能用到响应式工具 |
| **dayjs** | 日期格式化 | `utils/format.ts` 里格式化发布时间 |
| **Vitest** | 单元测试 | `tests/utils.test.ts` |
| **Playwright** | E2E 测试 | `e2e/blog.spec.ts`，`npm run test:e2e` |
| **Meilisearch** | 全文搜索引擎 | `server/utils/meilisearch.ts`，未配置时回退 MySQL |
| **TipTap / Vditor** | 富文本 / Markdown 编辑器 | `ArticleEditor.vue` 双模式写作 |
| **ioredis**（可选） | Redis 客户端 | 热门文章缓存 + 阅读量缓冲（`viewCount.ts`） |
| **cloudinary / ali-oss / qiniu** | 对象存储 SDK | `server/utils/storage.ts` 多驱动图床 |

---

## 4. 目录结构（重点文件夹）

```
demo-vuessr/
├── pages/                 # 【页面 = 路由】每个 .vue 文件对应一个 URL
│   ├── index.vue          #   /
│   ├── posts/[slug].vue   #   /posts/:slug
│   ├── admin/             #   后台页面，/admin/*
│   └── ...
├── components/            # 【可复用组件】被 pages 引用
│   ├── PostCard.vue       #   文章卡片
│   ├── Sidebar.vue        #   侧边栏（分类、标签、热门）
│   ├── CommentSection.vue #   评论区
│   └── admin/             #   后台专用组件
├── layouts/               # 【布局】包在页面外面
│   ├── default.vue        #   前台：顶栏 + 内容 + 底栏
│   └── admin.vue          #   后台：侧边栏 + 顶栏 + 标签页
├── composables/           # 【组合式函数】类似 React Hooks，全局复用逻辑
│   ├── useAuth.ts         #   登录状态
│   ├── useSeo.ts          #   SEO Meta
│   ├── usePermission.ts   #   权限码
│   ├── useAdminMenu.ts    #   动态后台菜单
│   └── useAdminTabs.ts    #   多页签
├── middleware/            # 【路由守卫】进入页面前执行
│   └── admin-auth.ts      #   后台必须 admin 登录
├── plugins/               # 【插件】扩展 Vue
│   ├── auth-directive.ts      # v-auth 按钮权限（含 SSR getSSRProps）
│   └── analytics.client.ts    # GA + 百度统计
├── assets/css/            # 全局 CSS
├── utils/                 # 纯前端工具（如 formatDate）
├── server/                # 【后端代码】只在服务端运行
│   ├── api/               #   REST API，/api/* 自动映射
│   ├── database/          #   表结构、连接、种子数据
│   ├── routes/            #   自定义路由（如 /rss.xml）
│   ├── utils/             #   服务端工具（auth、markdown、post、storage、meilisearch 等）
│   ├── scripts/           #   CLI（search:reindex）
│   └── middleware/        #   服务端中间件（请求日志）
├── e2e/                   # Playwright E2E 测试
├── public/                # 静态文件，原样对外提供
├── nuxt.config.ts         # Nuxt 总配置
└── docs/                  # 文档
```

**Nuxt 约定（新人必记）**：

- `pages/` → 路由
- `components/` → 组件，可直接在模板里用（无需 import）
- `composables/useXxx.ts` → 自动 import 为 `useXxx()`
- `server/api/foo.get.ts` → `GET /api/foo`
- `server/api/foo.post.ts` → `POST /api/foo`

---

## 5. 一次完整请求是怎么走的？

以 **首页加载文章列表** 为例：

```
1. 用户打开 http://localhost:3000/
2. Nuxt 匹配 pages/index.vue
3. 页面 setup 里执行：
   const { data } = await useFetch('/api/posts', { query: { page: 1, ... } })
4. 服务端渲染时，Nuxt 内部请求 server/api/posts/index.get.ts
5. API 调用 server/utils/post.ts 的 getPublishedPosts()
6. Drizzle 查询 MySQL posts 表
7. 返回 JSON：{ data: { list: [...], total: 100 } }
8. 页面用 computed 取出 list，渲染 <PostCard />
9. 完整 HTML 返回浏览器（SEO 友好）
```

**前端常用两种调接口方式**：

| 方式 | 场景 | 示例 |
|------|------|------|
| `useFetch` | 页面初次加载、需要 SSR | `await useFetch('/api/posts')` |
| `$fetch` | 用户点击按钮、表单提交 | `$fetch('/api/comments', { method: 'POST', body })` |

API 统一返回格式（见 `server/utils/auth.ts` 的 `apiSuccess` / `apiError`）：

```json
{ "data": { ... } }
{ "message": "错误信息" }
```

---

## 6. 功能一览

### 6.1 前台（访客 / 普通用户）

| 功能 | 路由 | 说明 |
|------|------|------|
| 首页文章列表 | `/` | 最新 / 热门排序、分页 |
| 文章详情 | `/posts/:slug` | Markdown 渲染、点赞收藏、评论、相关文章 |
| 分类列表 | `/categories/:slug` | 某分类下的文章 |
| 标签列表 | `/tags/:slug` | 某标签下的文章 |
| 搜索 | `/search?keyword=` | Meilisearch 全文搜索（未配置则 MySQL LIKE） |
| 作者列表 / 详情 | `/authors`、`/authors/:username` | 多作者及其文章 |
| 归档 | `/archive` | 按年月分组的时间线 |
| 关于 | `/about` | 站点介绍（内容来自 settings 表） |
| 登录 / 注册 | `/login`、`/register` | 普通用户账号 |
| 个人中心 | `/user/profile` | 修改资料 |
| 我的收藏 | `/user/favorites` | 收藏的文章 |
| 暗色模式 | 全局 | 顶栏切换，跟随系统默认 |
| RSS | `/rss.xml` | 订阅源 |
| Sitemap | `/sitemap.xml` | 搜索引擎抓取 |

### 6.2 后台（管理员）

| 功能 | 路由 | 说明 |
|------|------|------|
| 登录 | `/admin/login` | 仅 admin 角色可进后台 |
| 仪表盘 | `/admin` | 文章 / 评论统计 |
| 文章管理 | `/admin/posts` | 列表、编辑、软删除 |
| 回收站 | `/admin/posts/trash` | 恢复 / 永久删除 |
| 写文章 | `/admin/posts/new` | Vditor + TipTap 双模式编辑器 |
| 分类 / 标签 | `/admin/categories`、`/admin/tags` | CRUD |
| 评论审核 | `/admin/comments` | 通过 / 拒绝 / 删除 |
| 用户管理 | `/admin/users` | 禁用用户、角色 |
| 角色权限 | `/admin/roles` | RBAC 权限码配置 |
| 菜单管理 | `/admin/menus` | 动态侧栏菜单 |
| 操作日志 | `/admin/logs` | 登录、删文等审计 |
| 站点设置 | `/admin/settings` | 关于页、GA、百度统计、重建搜索索引 |
| API 文档 | `/admin/api-docs` | Scalar 嵌入 OpenAPI |

后台页面统一使用 `layouts/admin.vue`（**动态侧栏**来自 `useAdminMenu` + `/api/admin/menus`），并通过 `middleware/admin-auth.ts` 拦截未登录或非 admin 用户。

---

## 7. 各功能实现方式（按模块）

下面每个功能都说明：**页面在哪、接口在哪、核心逻辑在哪**。

---

### 7.1 文章列表（首页 / 分类 / 标签 / 搜索）

**页面**

| 场景 | 文件 |
|------|------|
| 首页 | `pages/index.vue` |
| 分类 | `pages/categories/[slug].vue` |
| 标签 | `pages/tags/[slug].vue` |
| 搜索 | `pages/search.vue` |

**实现要点**

1. 页面用 `useFetch('/api/posts', { query: { page, category, tag, keyword, orderBy } })` 拉数据
2. 列表项用 `components/PostCard.vue` 展示标题、摘要、分类、标签、时间
3. 翻页用 `components/Pagination.vue`，改 `page` 后调用 `refresh()`

**接口**

- `GET /api/posts` → `server/api/posts/index.get.ts`
- 核心查询：`server/utils/post.ts` 的 `getPublishedPosts()`
  - 只查 `status = published` 且未软删除的文章
  - 支持按分类 slug、标签 slug、关键词过滤
  - `orderBy=popular` 时按阅读量排序，且第一页会走 Redis/内存缓存

---

### 7.2 文章详情

**页面**：`pages/posts/[slug].vue`

**实现要点**

1. 从路由取 `slug`：`route.params.slug`
2. `useFetch('/api/posts/${slug}')` 获取文章
3. 404 处理：`error` 或无数据时 `throw createError({ statusCode: 404 })`
4. 正文用 `v-html="post.htmlContent"` 渲染（HTML 在服务端由 Markdown 转好）
5. 嵌入 `CommentSection` 评论组件
6. 点赞 / 收藏：登录后 `$fetch` POST 接口，再 `refresh()` 刷新

**接口**

- `GET /api/posts/:slug` → `server/api/posts/[slug].get.ts`
- 会递增 `viewCount`，并查相关文章、标签、分类

**SEO**

- 调用 `usePageSeo({ title, description, type: 'article', ... })` 注入 meta 和 JSON-LD

---

### 7.3 Markdown 写作与渲染

**写作（后台）**

- 页面：`pages/admin/posts/new.vue`、`pages/admin/posts/[id].vue`
- 编辑器：`components/ArticleEditor.vue`（Vditor / TipTap 切换）
  - `components/MarkdownEditor.vue` — Vditor 封装
  - `components/TipTapEditor.vue` — 富文本，Turndown 转 Markdown
- 封面：`components/ImageUpload.vue` → `POST /api/upload/image`
- 可选指定 **作者**（`authorId`），默认当前登录用户

**渲染（服务端）**

- `server/utils/markdown.ts` — markdown-it + highlight.js + anchor
- 发布时 API 将 `content` 转为 `contentHtml` 存库

**前台预览**：`composables/useMarkdownPreview.ts`

---

### 7.4 分类与标签

**前台展示**

- 侧边栏 `components/Sidebar.vue` 拉 `/api/categories` 和 `/api/tags`
- 分类页 / 标签页本质也是调 `/api/posts` 加不同 query

**后台管理**

- `pages/admin/categories/index.vue`
- `pages/admin/tags/index.vue`
- 表格组件：`components/admin/AdminDynamicTable.vue`（搜索、分页、CSV 导出）

**接口**

- 公开：`GET /api/categories`、`GET /api/tags`
- 管理：`server/api/admin/categories/[id].ts`、`server/api/admin/tags/[id].ts`

**数据库**

- `categories` 表 — 名称、slug、描述
- `tags` 表 — 名称、slug
- `post_tags` 表 — 文章和标签多对多

---

### 7.5 搜索

**页面**：`pages/search.vue`

**接口**：`GET /api/search?keyword=` → `server/api/search.get.ts`

**实现**

1. 若配置了 Meilisearch（`MEILISEARCH_HOST`）→ `server/utils/meilisearch.ts` 的 `searchPostsMeili()`
2. 否则回退 `getPublishedPosts({ keyword })`（MySQL LIKE）
3. 文章 CRUD 时通过 `server/utils/postIndex.ts` 的 `syncPostToIndex()` 同步索引
4. 全量重建：`POST /api/admin/search/reindex` 或 `npm run search:reindex`

---

### 7.6 归档

**页面**：`pages/archive.vue`

**接口**：`GET /api/archive` → `server/api/archive.get.ts`

**逻辑**：查出所有已发布文章，按 `YYYY年MM月` 分组返回，页面用 `v-for` 渲染时间线。

---

### 7.7 评论系统

**组件**

- `components/CommentSection.vue` — 评论表单 + 列表
- `components/CommentItem.vue` — 单条评论 + **嵌套回复**（depth 缩进、@ 回复名）

**流程**

1. 加载：`GET /api/comments?postId=`
2. 提交：`POST /api/comments`，默认 `status = pending`（待审核）
3. 登录用户可带 `userId`，游客填昵称 / 邮箱
4. 支持回复：`parentId` 指向父评论

**后台审核**

- `pages/admin/comments/index.vue`
- `PUT /api/admin/comments/:id` — 改为 approved / rejected
- 前台只展示 `approved` 评论

**防刷**

- `server/utils/rateLimit.ts` — 评论、登录等接口限流

---

### 7.8 用户认证（登录 / 注册 / 退出）

**前端状态**：`composables/useAuth.ts`

- 用 `useState('auth-user')` 存当前用户（Nuxt 提供的 SSR 友好全局状态）
- `login()` / `register()` / `logout()` 封装 `$fetch`
- `fetchUser()` 使用 `$fetch`（避免 mounted 后 `useFetch` 警告）

**接口**

| 接口 | 文件 | 作用 |
|------|------|------|
| POST `/api/auth/login` | `server/api/auth/login.post.ts` | 校验密码 → 写 JWT Cookie |
| POST `/api/auth/register` | `server/api/auth/register.post.ts` | 注册普通用户 |
| POST `/api/auth/logout` | `server/api/auth/logout.post.ts` | 清 Cookie |
| GET `/api/auth/me` | `server/api/auth/me.get.ts` | 当前登录用户 |

**Cookie 方案**（`server/utils/auth.ts`）

- JWT 存在名为 `blog_token` 的 **HttpOnly Cookie** 里
- 前端 JS 读不到 token，更安全
- 管理 API 用 `requireAuth()` / `requireAdmin()` 校验

**后台路由守卫**：`middleware/admin-auth.ts`

- 访问 `/admin/*` 时检查 `/api/auth/me`
- 未登录 → 跳转 `/admin/login`
- 非 admin → 跳转前台登录页

---

### 7.9 权限系统（细粒度按钮控制）

**数据库**

- `permissions` — 权限码，如 `post:delete`
- `role_permissions` — 角色和权限的对应关系

**前端**

- `composables/usePermission.ts` — 拉取 `/api/auth/permissions`
- `plugins/auth-directive.ts` — 指令 `v-auth="'post:delete'"`（须含 `getSSRProps`，否则 SSR 报错）

**服务端**

- `server/utils/permission.ts` — `requirePermission(event, 'post:update')` 等

---

### 7.10 点赞与收藏

**页面**：文章详情页按钮

**接口**

- `POST /api/posts/:id/like` → `server/api/posts/[id]/like.post.ts`
- `POST /api/posts/:id/favorite` → `server/api/posts/[id]/favorite.post.ts`
- `GET /api/user/favorites` → 收藏列表页 `pages/user/favorites.vue`

**数据库**：`post_likes`、`post_favorites` 表，用户 + 文章联合主键，防止重复点赞。

---

### 7.11 站点设置与关于页

**页面**

- 关于：`pages/about.vue` — 读 `/api/settings` 里 `about` 键
- 后台：`pages/admin/settings/index.vue` — 含 GA / 百度统计 ID、Meilisearch 重建按钮

**数据库**：`settings` 表，key-value 结构（如 `about`、`site_title`）。

---

### 7.12 SEO、RSS、Sitemap

**SEO（每个页面）**

- 调用 `composables/useSeo.ts` 的 `usePageSeo()`
- 内部用 Nuxt 的 `useSeoMeta()` + `useHead()` 写 meta、canonical、JSON-LD

**RSS**

- 路由：`server/routes/rss.xml.get.ts`（不是 `server/api`，直接 `/rss.xml`）
- 查最新 20 篇文章，拼 RSS XML

**Sitemap**

- 模块 `@nuxtjs/sitemap` 在 `nuxt.config.ts` 配置
- 动态 URL：`server/api/__sitemap__/urls.get.ts` 返回所有已发布文章链接

**ISR / SWR**

- `nuxt.config.ts` 的 `routeRules`：首页、文章、分类、标签、**作者页** 等设置 `isr` + `swr`

**访问统计**

- `plugins/analytics.client.ts` — 读取 settings 或 `.env` 中的 GA / 百度统计 ID

---

### 7.13 暗色模式

**配置**：`nuxt.config.ts` → `colorMode`

**使用**：`components/AppHeader.vue`

```ts
const colorMode = useColorMode()
colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
```

Tailwind 的 `dark:` 前缀类会自动跟随 `<html class="dark">`。

---

### 7.14 管理后台 UI

**布局**：`layouts/admin.vue`

- 左侧 **动态导航**（`composables/useAdminMenu.ts`）+ 顶栏 + `AdminTabs` 多标签页

**通用组件**

| 组件 | 作用 |
|------|------|
| `AdminDynamicTable.vue` | 列表页表格 |
| `AdminSchemaForm.vue` | 动态表单 |
| `AdminBreadcrumb.vue` | 面包屑 |
| `AdminLockScreen.vue` | 长时间无操作锁屏 |

**文章 CRUD 接口**

- `GET/POST /api/admin/posts` → `server/api/admin/posts/index.ts`
- `GET/PUT/DELETE /api/admin/posts/:id` → `server/api/admin/posts/[id].ts`
- 回收站：`GET /api/admin/posts/trash`，`POST .../restore`，`DELETE .../permanent`

---

### 7.15 图片上传与图床

**接口**：`POST /api/upload/image` → `server/api/upload/image.post.ts`

**存储**：`server/utils/storage.ts`

| `STORAGE_DRIVER` | 说明 |
|------------------|------|
| `local` | 默认，`public/uploads/` |
| `aliyun` | 阿里云 OSS |
| `qiniu` | 七牛云 |
| `cloudinary` | Cloudinary 图床 |

未配置密钥时自动回退本地。

---

### 7.16 阅读量缓冲

- `server/utils/viewCount.ts` — Redis `INCR` 缓冲，批量写回 MySQL
- `getPostBySlug` 展示阅读量 = DB 值 + Redis 增量
- 依赖 `REDIS_URL`；无 Redis 时用 `server/utils/cache.ts` 内存降级

---

### 7.17 多作者

- 前台：`pages/authors/index.vue`、`pages/authors/[username].vue`
- API：`GET /api/authors`、`GET /api/authors/:username`
- `getPublishedPosts({ authorId })` 按作者筛选
- `PostCard` / 文章详情展示作者链接

---

### 7.18 操作日志

**页面**：`pages/admin/logs/index.vue`

**接口**：`GET /api/admin/logs`

**写入**：`server/utils/logger.ts` 的 `writeLog()`（登录、删文等）

---

### 7.19 回收站

- 删除文章 → 设置 `deletedAt`（软删除），同步 Meilisearch 移除
- `pages/admin/posts/trash.vue` — 列表、恢复、永久删除
- API：`server/api/admin/posts/trash.get.ts`、`restore.post.ts`、`permanent.delete.ts`

---

## 8. 数据库表关系（简图）

```
users ──────< posts >────── categories
  │              │
  │              ├──< post_tags >── tags
  │              │
  │              ├──< comments
  │              ├──< post_likes
  │              └──< post_favorites

permissions ──< role_permissions（按 role 关联）
admin_menus（动态后台菜单）

settings（键值对，站点配置）
```

表定义完整代码：`server/database/schema.ts`  
初始化示例数据：`npm run db:seed` → `server/database/seed.ts`

---

## 9. 配置文件与环境变量

**`nuxt.config.ts` 重点**

| 配置项 | 含义 |
|--------|------|
| `ssr: true` | 开启服务端渲染 |
| `runtimeConfig` | 服务端私密配置 + `public` 下可暴露给前端的配置 |
| `modules` | Tailwind、color-mode、sitemap |
| `routeRules` | ISR、API CORS |

**常用环境变量**（见 `.env.example`）

| 变量 | 作用 |
|------|------|
| `NUXT_PUBLIC_SITE_URL` | 站点 URL（SEO、sitemap） |
| `NUXT_PUBLIC_SITE_NAME` | 站点名称 |
| `JWT_SECRET` | JWT 签名密钥，生产必改 |
| `DB_*` | MySQL 连接信息 |
| `REDIS_URL` | 可选，缓存 + 阅读量缓冲 |
| `MEILISEARCH_HOST` / `MEILISEARCH_API_KEY` | 可选，全文搜索 |
| `STORAGE_DRIVER` | 图床：`local` / `aliyun` / `qiniu` / `cloudinary` |
| `NUXT_PUBLIC_GA_ID` / `NUXT_PUBLIC_BAIDU_TONGJI_ID` | 统计（可被 settings 覆盖） |

---

## 10. 新人常见改动场景

| 你想做什么 | 去哪里改 |
|------------|----------|
| 改首页布局 / 样式 | `pages/index.vue`、`components/PostCard.vue` |
| 改顶栏导航 | `components/AppHeader.vue` |
| 加一个新前台页面 | 新建 `pages/xxx.vue`，自动有路由 |
| 加一个新 API | 新建 `server/api/xxx.get.ts` 或 `.post.ts` |
| 改数据库字段 | `server/database/schema.ts` → `npm run db:push` |
| 改登录逻辑 | `server/api/auth/login.post.ts`、`composables/useAuth.ts` |
| 改 SEO 规则 | `composables/useSeo.ts` |
| 改全局样式 / 主题色 | `assets/css/main.css`、`tailwind.config.ts` |
| 改后台菜单 | `pages/admin/menus/` 或数据库 `admin_menus` |
| 配置图床 / 搜索 | 见 [TUTORIAL.md](./TUTORIAL.md) |

---

## 11. 本地快速验证

```bash
npm install
cp .env.example .env
docker compose up mysql -d    # 或用本地 MySQL
npm run db:push && npm run db:seed
npm run dev
```

| 地址 | 账号 |
|------|------|
| 前台 http://localhost:3000 | — |
| 后台 http://localhost:3000/admin/login | admin / admin123 |

构建检查：`npm run build`  
单元测试：`npm run test`  
E2E 测试：`npm run test:e2e`（需 dev 服务）

---

## 12. 相关文档

| 文档 | 内容 |
|------|------|
| [TUTORIAL.md](./TUTORIAL.md) | 管理员使用教程（写文章、图床、搜索、权限） |
| [STARTUP.md](./STARTUP.md) | 本地启动详细步骤 |
| [TECH_PLAN.md](./TECH_PLAN.md) | 技术规划与 API 一览 |
| [ROADMAP.md](./ROADMAP.md) | 功能路线图 |
| [DEPLOY.md](./DEPLOY.md) | Docker / 生产部署 |
| [Nuxt 4 官方文档](https://nuxt.com/docs) | 框架权威参考 |
| [Vue 3 官方文档](https://cn.vuejs.org/) | Composition API |

---

## 13. 给新人的最后建议

1. **先跑起来，再改代码** — 看着浏览器对照 `pages/` 文件读，比干看文档快。
2. **改前台从 `pages/` + `components/` 入手** — 不必一开始就看 Drizzle。
3. **改接口必看 `server/api/` + `server/utils/`** — 业务逻辑多在 utils 里，API 文件往往很薄。
4. **注意 SSR** — 在 `setup` 里不要用 `window`、`document`，放到 `onMounted` 里。
5. **用 DevTools** — Nuxt DevTools 可查看路由、请求、组件树（`nuxt.config.ts` 已开启）。

有问题可以先在仓库里 **全文搜索** 关键词（如 `useFetch('/api/posts'`、`requireAdmin`），通常能定位到所有相关文件。
