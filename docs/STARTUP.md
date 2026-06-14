# 本地启动命令手册

> 项目路径：`demo-vuessr`  
> 版本：2.1.0 · Nuxt 4  
> 开发者读代码见 [ONBOARDING.md](./ONBOARDING.md)，运营使用见 [TUTORIAL.md](./TUTORIAL.md)

---

## 一、日常启动（3 步）

```bash
cd demo-vuessr
brew services start mysql    # 未运行时；或用 Docker MySQL
npm run dev
```

| 页面 | 地址 |
|------|------|
| 博客首页 | http://localhost:3000 |
| 作者列表 | http://localhost:3000/authors |
| 搜索 | http://localhost:3000/search |
| 用户登录 | http://localhost:3000/login |
| 管理后台 | http://localhost:3000/admin/login |
| API 文档 | http://localhost:3000/admin/api-docs |

**默认管理员：** `admin` / `admin123`

---

## 二、首次部署到本机

```bash
cd demo-vuessr
npm install
cp .env.example .env

# MySQL（Homebrew 示例）
brew services start mysql
mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'blog'@'localhost' IDENTIFIED BY 'blog123';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog'@'localhost';
FLUSH PRIVILEGES;
"

npm run db:push
npm run db:seed
npm run dev
```

---

## 三、可选服务

### Meilisearch（全文搜索）

```bash
docker compose up meilisearch -d
```

`.env`：

```env
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=dev-master-key
```

重建索引：

```bash
npm run search:reindex
# 或后台「站点设置 → 重建 Meilisearch 索引」
```

### Redis（缓存 + 阅读量缓冲）

```env
REDIS_URL=redis://localhost:6379
```

未配置时使用内存缓存（开发可用）。

---

## 四、启动前自检

```bash
brew services list | grep mysql
mysql -u blog -pblog123 -e "USE blog_db; SHOW TABLES;"
lsof -i :3000
node -v    # 推荐 20+
```

---

## 五、停止服务

```bash
# dev：终端 Ctrl+C
lsof -ti :3000 | xargs kill

brew services stop mysql   # 可选
```

---

## 六、常用命令

```bash
npm run dev              # 开发
npm run build            # 生产构建
npm run preview          # 预览构建
npm run test             # 单元测试
npm run test:e2e         # E2E（需 dev 已启动）
npm run search:reindex   # Meilisearch 全量索引
npm run db:push          # 同步表结构
npm run db:seed          # 种子数据
npm run pm2:start        # PM2 生产
```

---

## 七、环境配置（.env 摘要）

```env
NUXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-me
DB_HOST=localhost
DB_USER=blog
DB_PASSWORD=blog123
DB_NAME=blog_db

# 可选
# REDIS_URL=redis://localhost:6379
# MEILISEARCH_HOST=http://127.0.0.1:7700
# MEILISEARCH_API_KEY=dev-master-key
# STORAGE_DRIVER=local
# NUXT_PUBLIC_GA_ID=
# NUXT_PUBLIC_BAIDU_TONGJI_ID=
```

完整说明见 `.env.example` 与 [TUTORIAL.md](./TUTORIAL.md)。

---

## 八、常见问题

| 问题 | 处理 |
|------|------|
| `Access denied for user 'blog'` | 用 root 重建 blog 用户（见第二节） |
| 端口 3000 被占用 | `lsof -ti :3000 \| xargs kill` 后重跑 `npm run dev` |
| 表不存在 | `npm run db:push && npm run db:seed` |
| 后台页 500 / getSSRProps | 确认存在 `plugins/auth-directive.ts`（非 `.client.ts`） |
| 后台进不去 | 确认用户 `role='admin'` |
| 搜索无结果 | 启动 Meilisearch 并 `npm run search:reindex` |
| dev 长时间运行异常 | 重启 dev；必要时 `rm -rf .nuxt && npm run dev` |
| E2E 失败 | 确保 `localhost:3000` 可访问；`npx playwright install chromium` |

---

## 九、验证服务

```bash
curl -s -o /dev/null -w "首页: %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "后台: %{http_code}\n" http://localhost:3000/admin/login
curl -s "http://localhost:3000/api/posts" | head -c 80
```

---

更多历史记录：[LOCAL_SETUP_LOG.md](./LOCAL_SETUP_LOG.md) · 生产部署：[DEPLOY.md](./DEPLOY.md)
