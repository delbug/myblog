# 本地启动命令手册

> 项目路径：`/Users/xiaojiang/web/demo-vuessr`  
> 最后启动时间：2026-06-12  
> 本文档记录**启动项目所需的全部命令**及**本次实际执行记录**

---

## 一、日常启动（3 条命令）

每次开发前，按顺序执行：

```bash
# ① 进入项目目录
cd /Users/xiaojiang/web/demo-vuessr

# ② 启动 MySQL（若已在运行可跳过）
brew services start mysql

# ③ 启动 Nuxt 开发服务器
npm run dev
```

启动成功后访问：

| 页面 | 地址 |
|------|------|
| 博客首页 | http://localhost:3000 |
| 用户登录 | http://localhost:3000/login |
| 用户注册 | http://localhost:3000/register |
| 管理后台 | http://localhost:3000/admin/login |
| API 文档 | http://localhost:3000/admin/api-docs |

**默认管理员：** `admin` / `admin123`

---

## 二、首次部署到本机（完整流程）

若是第一次在这台电脑上跑，需额外执行：

```bash
# 1. 进入项目
cd /Users/xiaojiang/web/demo-vuessr

# 2. 安装 Node 依赖
npm install

# 3. 复制环境变量（.env 已存在则跳过）
cp .env.example .env

# 4. 启动 MySQL
brew services start mysql

# 5. 创建数据库和用户（root 密码示例：123456，仅需执行一次）
mysql -u root -p123456 -e "
CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'blog'@'localhost' IDENTIFIED BY 'blog123';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog'@'localhost';
FLUSH PRIVILEGES;
"

# 6. 同步数据库表结构
npm run db:push

# 7. 填充种子数据（管理员、分类、标签、示例文章、权限）
npm run db:seed

# 8. 启动开发服务器
npm run dev
```

---

## 三、启动前自检命令

```bash
# 检查 MySQL 服务状态
brew services list | grep mysql

# 检查 blog 用户能否连接数据库
mysql -u blog -pblog123 -e "USE blog_db; SHOW TABLES;"

# 检查 3000 端口是否被占用
lsof -i :3000

# 检查 Node 版本（需 18+，推荐 20+）
node -v
```

---

## 四、停止服务

```bash
# 停止开发服务器：在运行 npm run dev 的终端按 Ctrl + C
# 或强制结束占用 3000 端口的进程：
lsof -ti :3000 | xargs kill

# 停止 MySQL（可选）
brew services stop mysql
```

---

## 五、其他常用命令

```bash
# 生产构建
npm run build

# 预览生产构建
npm run preview

# 单元测试
npm run test

# 数据库 Schema 变更后同步
npm run db:push

# 重新填充种子数据
npm run db:seed

# PM2 生产启动（需先 npm run build）
npm run pm2:start
```

---

## 六、环境配置说明（.env）

```env
NUXT_PUBLIC_SITE_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=blog
DB_PASSWORD=blog123
DB_NAME=blog_db
JWT_SECRET=your-super-secret-jwt-key-change-me
```

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 应用账号 | blog / blog123 | `.env` 中配置，应用连接用 |
| MySQL root | root / 123456 | 仅管理数据库用，不在 .env 中 |

---

## 七、2026-06-12 本次实际执行记录

以下为助手在本机实际跑过的命令及结果：

### 步骤 1：检查环境

```bash
brew services list 2>/dev/null | rg mysql
lsof -i :3000
test -d /Users/xiaojiang/web/demo-vuessr/node_modules && echo "node_modules: OK"
```

**结果：**
- MySQL：`started` ✅
- 3000 端口：空闲 ✅
- `node_modules`：已存在 ✅

### 步骤 2：验证数据库连接

```bash
mysql -u blog -pblog123 -e "USE blog_db; SELECT COUNT(*) AS posts FROM posts;"
```

**结果：** 连接成功，当前有 3 篇文章 ✅

### 步骤 3：启动开发服务器

```bash
cd /Users/xiaojiang/web/demo-vuessr
npm run dev
```

**结果：** 开发服务器已在后台运行 ✅  
**地址：** http://localhost:3000

### 步骤 4：验证服务可用

```bash
curl -s -o /dev/null -w "首页: %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "后台登录: %{http_code}\n" http://localhost:3000/admin/login
curl -s http://localhost:3000/api/posts | head -c 120
```

**结果：** 首页 200、后台登录 200、API 正常返回 JSON ✅

---

## 八、常见问题

| 问题 | 解决命令 |
|------|----------|
| `Access denied for user 'blog'` | 用 root 重新创建 blog 用户（见第二节第 5 步） |
| 端口 3000 被占用 | `lsof -ti :3000 \| xargs kill` 后重新 `npm run dev` |
| 表不存在 | `npm run db:push && npm run db:seed` |
| 管理员无法进后台 | `mysql -u root -p123456 -e "UPDATE blog_db.users SET role='admin' WHERE username='admin';"` |

---

更多细节见：[LOCAL_SETUP_LOG.md](./LOCAL_SETUP_LOG.md) | [DEPLOY.md](./DEPLOY.md)
