# Vue + Nuxt 4 + MySQL 个人博客

支持 SEO 的个人技术博客，参考博客园 / 掘金功能设计，Nuxt 全栈（SSR + API 一体），可 Docker 一键部署。

**当前版本：** 2.1.0

---

## 功能概览

### 前台

- SSR 服务端渲染，SEO 友好（Meta、JSON-LD、Sitemap、RSS）
- Markdown 文章、代码高亮、封面图、相关文章
- 分类、标签、归档、全文搜索（Meilisearch / MySQL 回退）
- 多作者页 `/authors`
- 评论（嵌套回复、审核机制）
- 点赞、收藏、用户注册登录
- 暗色模式、ISR 增量缓存（高流量页面）

### 后台

- 仪表盘、文章 CRUD、**回收站**（恢复 / 永久删除）
- **双模式编辑器**：Vditor（Markdown）+ TipTap（富文本，自动转 Markdown）
- **封面 / 文中图片上传**（本地 / 阿里云 OSS / 七牛 / Cloudinary）
- 分类、标签、评论、用户、**角色权限**、**动态菜单**
- 操作日志、站点设置（含 GA / 百度统计 ID）
- Scalar API 文档 `/admin/api-docs`
- 按钮级权限 `v-auth`、多页签、锁屏

### 基础设施

- Redis 可选缓存（热门文章 + **阅读量缓冲**）
- Meilisearch 全文搜索（可选）
- Playwright E2E + Vitest 单元测试
- PM2 / Docker Compose / GitHub Actions CI

---

## 快速启动

```bash
cd demo-vuessr
npm install
cp .env.example .env          # 首次
brew services start mysql     # 或 docker compose up mysql -d
npm run db:push && npm run db:seed
npm run dev
```

| 地址 | 账号 |
|------|------|
| 前台 http://localhost:3000 | — |
| 后台 http://localhost:3000/admin/login | `admin` / `admin123` |

可选服务：

```bash
docker compose up meilisearch -d   # 全文搜索
# .env 中配置 REDIS_URL=redis://localhost:6379  # 阅读量缓冲
```

---

## 文档索引

| 文档 | 适合谁 | 内容 |
|------|--------|------|
| [新人上手指南](docs/ONBOARDING.md) | 新加入的前端 / 全栈 | 项目地图、目录结构、各功能对应文件 |
| [使用教程](docs/TUTORIAL.md) | 管理员 / 运营 | 写文章、图床、搜索、权限、统计 |
| [本地启动手册](docs/STARTUP.md) | 开发者 | 启动命令、环境自检、常见问题 |
| [技术规划](docs/TECH_PLAN.md) | 架构 / 接口设计 | 技术栈、API 一览、架构图 |
| [功能路线图](docs/ROADMAP.md) | 产品 / 维护者 | 已完成功能与版本演进 |
| [部署文档](docs/DEPLOY.md) | 运维 | Docker / VPS / 生产检查清单 |

---

## 常用命令

```bash
npm run dev              # 开发
npm run build            # 生产构建
npm run test             # 单元测试
npm run test:e2e         # E2E 测试（需 dev 服务）
npm run search:reindex   # 重建 Meilisearch 索引
npm run db:push          # 同步表结构
npm run db:seed          # 种子数据
```

---

## 技术栈

Vue 3 · Nuxt 4 · MySQL · Drizzle ORM · Tailwind CSS · Meilisearch · Redis（可选）· TipTap · Vditor

---

## Docker 部署

```bash
cp .env.example .env
docker compose up -d --build
```

详见 [部署文档](docs/DEPLOY.md)
