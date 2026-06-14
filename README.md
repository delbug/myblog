# Vue + Nuxt 3 + MySQL 个人博客

支持 SEO 的个人技术博客，参考博客园/掘金功能设计，可 Docker 一键部署。

## 功能

- SSR 服务端渲染，SEO 友好
- Markdown 写作 + 代码高亮
- 分类、标签、搜索、归档
- 评论系统（审核机制）
- RSS 订阅 + Sitemap
- 管理后台（文章 CRUD、评论审核、站点设置）
- 暗色模式

详见 [本地启动命令手册](docs/STARTUP.md)

## 快速启动

```bash
cd /Users/xiaojiang/web/demo-vuessr
brew services start mysql   # MySQL 未运行时
npm run dev
```

访问 http://localhost:3000 | 后台 http://localhost:3000/admin/login（admin / admin123）

## 本地已启动

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动 MySQL
docker compose up mysql -d

# 初始化数据库
npm run db:push && npm run db:seed

# 开发
npm run dev
```

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login（admin / admin123）

## Docker 部署

```bash
docker compose up -d --build
```

详见 [部署文档](docs/DEPLOY.md)

## 技术文档

详见 [技术规划文档](docs/TECH_PLAN.md)

## 技术栈

Vue 3 · Nuxt 3 · MySQL · Drizzle ORM · Tailwind CSS
