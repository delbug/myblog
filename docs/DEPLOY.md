# 部署文档

本文档介绍如何将 Vue + Nuxt 3 + MySQL 个人博客部署到生产环境。

---

## 方式一：Docker Compose 一键部署（推荐）

最简单的方式，一条命令启动 MySQL + 博客应用。

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 步骤

```bash
# 1. 克隆项目并进入目录
cd demo-vuessr

# 2. 复制并编辑环境变量
cp .env.example .env
```

编辑 `.env`，**务必修改以下配置**：

```env
NUXT_PUBLIC_SITE_URL=https://your-domain.com
NUXT_PUBLIC_SITE_NAME=我的博客
JWT_SECRET=请替换为一串随机长字符串
DB_PASSWORD=请替换为强密码
DB_ROOT_PASSWORD=请替换为强密码
```

```bash
# 3. 启动 MySQL + Meilisearch（可选）
docker compose up mysql meilisearch -d

# 4. 等待 MySQL 就绪（约 15 秒），初始化数据库
npm install
npm run db:push
npm run db:seed

# 5. 构建并启动应用
docker compose up app -d --build

# 或者一键启动全部服务
docker compose up -d --build
```

### 验证

| 地址 | 说明 |
|------|------|
| http://localhost:3000 | 博客首页 |
| http://localhost:3000/admin/login | 管理后台 |
| http://localhost:3000/sitemap.xml | 站点地图 |
| http://localhost:3000/rss.xml | RSS 订阅 |

默认管理员账号：`admin` / `admin123`（**部署后立即修改密码**）

部署后若启用 Meilisearch，在容器内或宿主机执行：

```bash
npm run search:reindex
```

或在后台 **站点设置 → 重建 Meilisearch 索引**。

### 常用命令

```bash
# 查看日志
docker compose logs -f app

# 停止服务
docker compose down

# 停止并清除数据（⚠️ 会删除数据库）
docker compose down -v

# 重启应用
docker compose restart app
```

---

## 方式二：手动部署（VPS / 云服务器）

适合已有 MySQL 实例或使用云数据库的场景。

### 前置要求

- Node.js 20+
- MySQL 8.0+
- Nginx（反向代理，可选）
- PM2（进程管理，可选）

### 步骤

#### 1. 准备 MySQL 数据库

```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blog'@'%' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog'@'%';
FLUSH PRIVILEGES;
```

#### 2. 部署应用

```bash
# 上传代码到服务器
cd /var/www/blog

# 安装依赖
npm ci

# 配置环境变量
cp .env.example .env
vim .env   # 修改数据库连接、JWT_SECRET、站点 URL

# 初始化数据库
npm run db:push
npm run db:seed

# 构建生产版本
npm run build

# 启动（测试）
node .output/server/index.mjs
```

#### 3. 使用 PM2 守护进程

```bash
npm install -g pm2

# 启动
pm2 start .output/server/index.mjs --name blog

# 开机自启
pm2 save
pm2 startup
```

#### 4. Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用 HTTPS（Let's Encrypt）
sudo certbot --nginx -d your-domain.com
```

---

## 方式三：Vercel / Netlify（不推荐）

本项目依赖 **MySQL 数据库** 和 **Nuxt SSR 服务端 API**，不适合纯静态托管。

如果必须使用 Serverless 平台，需要：
1. 将 MySQL 换为 Serverless 兼容数据库（如 PlanetScale、Neon）
2. 或使用 NuxtHub / Supabase 等 BaaS 方案

---

## 可选组件配置

### Meilisearch

`docker-compose.yml` 已包含 `meilisearch` 服务。`.env`：

```env
MEILISEARCH_HOST=http://meilisearch:7700   # Docker 内网
MEILISEARCH_API_KEY=请改为强密钥
```

### Redis

```env
REDIS_URL=redis://your-redis:6379
```

用于热门文章缓存与阅读量缓冲。

### 图床

```env
STORAGE_DRIVER=aliyun    # 或 qiniu / cloudinary / local
# 见 .env.example 中 OSS / 七牛 / Cloudinary 变量
```

### 访问统计

```env
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NUXT_PUBLIC_BAIDU_TONGJI_ID=your-baidu-id
```

也可在后台 **站点设置** 中填写（优先生效）。

---

## 生产环境检查清单

部署完成后，请逐项确认：

- [ ] 若使用 Meilisearch，已执行索引重建
- [ ] 若使用 OSS/Cloudinary，图片上传正常
- [ ] `JWT_SECRET` 已设为随机强密钥
- [ ] `NUXT_PUBLIC_SITE_URL` 设为真实域名（含 https）
- [ ] MySQL 密码足够复杂
- [ ] 已配置 HTTPS
- [ ] 访问 `/sitemap.xml` 正常
- [ ] 访问 `/rss.xml` 正常
- [ ] 查看网页源代码，确认文章内容在 HTML 中（SSR 生效）
- [ ] 使用 [Google Rich Results Test](https://search.google.com/test/rich-results) 验证结构化数据
- [ ] 在 Google Search Console 提交 Sitemap

---

## 数据库迁移

Schema 变更时的操作流程：

```bash
# 1. 修改 server/database/schema.ts

# 2. 生成迁移文件
npm run db:generate

# 3. 应用迁移
npm run db:migrate

# 开发环境也可直接 push（不生成迁移文件）
npm run db:push
```

---

## 故障排查

### 应用无法连接数据库

```bash
# 检查 MySQL 是否运行
docker compose ps mysql

# 测试连接
docker compose exec mysql mysql -u blog -pblog123 -e "SELECT 1"

# 检查环境变量
docker compose exec app env | grep DB_
```

### 页面 500 错误

```bash
# 查看应用日志
docker compose logs app --tail 100

# 确认表结构已创建
npm run db:push
```

### SEO 不生效

1. 确认 `NUXT_PUBLIC_SITE_URL` 配置正确
2. 使用「查看网页源代码」而非 DevTools Elements 面板
3. 确认文章 `status` 为 `published`

### 管理员无法登录

```bash
# 重新填充种子数据（会跳过已存在的数据）
npm run db:seed
```

---

## 备份与恢复

### 备份 MySQL

```bash
# Docker 环境
docker compose exec mysql mysqldump -u blog -pblog123 blog_db > backup.sql

# 恢复
docker compose exec -T mysql mysql -u blog -pblog123 blog_db < backup.sql
```

### 备份上传目录

如有自定义静态资源，备份 `public/` 目录。

---

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并重启
docker compose up app -d --build

# 或手动部署
npm ci
npm run db:push
npm run build
pm2 restart blog
```
