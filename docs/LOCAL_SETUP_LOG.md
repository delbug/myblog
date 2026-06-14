# 本地启动操作记录

> 文档生成时间：2026-06-12  
> 项目路径：`/Users/xiaojiang/web/demo-vuessr`  
> 执行人：Cursor AI 助手（按你的要求逐步执行并记录）

本文档记录**实际执行过的每一条命令**、**目的**、**执行结果**，方便你复现或排查问题。

---

## 一、环境检查（已完成）

### 1. 检查项目目录与工具版本

```bash
cd /Users/xiaojiang/web/demo-vuessr && ls -la && node -v && npm -v && docker --version 2>&1; mysql --version 2>&1
```

**结果：**
- Node.js：`v24.15.0`
- npm：`11.12.1`
- `node_modules` 已存在（依赖此前已安装）
- **Docker 未安装**（`command not found: docker`）
- MySQL 客户端已安装（Homebrew）

---

### 2. 检查 MySQL 服务与端口

```bash
brew services list 2>/dev/null | rg -i mysql
brew services start mysql
```

**结果：**
- Homebrew MySQL 服务：`mysql none` → 执行 `brew services start mysql` 后变为 **已启动**
- 本机 **未使用 Docker**，改用 Homebrew MySQL

---

### 3. 尝试 root 无密码登录（失败）

```bash
mysql -u root -e "SELECT VERSION(); SHOW DATABASES;"
```

**结果：** `ERROR 1045: Access denied`（root 需要密码）

---

### 4. 使用你提供的 root 密码登录（成功）

```bash
mysql -u root -p123456 -e "SELECT VERSION(); SHOW DATABASES;"
```

**结果：**
- MySQL 版本：`9.6.0`
- 数据库 `blog_db` **已存在**
- root 密码确认为：`123456`（由你提供）

> ⚠️ 建议不要把 root 密码提交到 Git。本文档仅作本地记录。

---

## 二、创建应用数据库账号（已完成）

项目 `.env` 中配置的应用账号为 `blog / blog123`，但该用户原先不存在。

### 5. 尝试 blog 用户连接（失败）

```bash
mysql -u blog -pblog123 -e "USE blog_db; SHOW TABLES;"
```

**结果：** `ERROR 1045: Access denied`

---

### 6. 用 root 创建 blog 用户并授权

第一次尝试（MySQL 9.6 不支持旧插件，失败）：

```bash
mysql -u root -p123456 -e "
CREATE USER IF NOT EXISTS 'blog'@'localhost' IDENTIFIED WITH mysql_native_password by 'blog123';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog'@'localhost';
FLUSH PRIVILEGES;
"
```

**结果：** `Plugin 'mysql_native_password' is not loaded`

第二次（成功）：

```bash
mysql -u root -p123456 -e "
CREATE USER IF NOT EXISTS 'blog'@'localhost' IDENTIFIED by 'blog123';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog'@'localhost';
FLUSH PRIVILEGES;
"
```

### 7. 验证 blog 用户可连接

```bash
mysql -u blog -pblog123 -e "USE blog_db; SHOW TABLES;"
```

**结果：** 连接成功（此时表尚未创建）

---

## 三、初始化数据库表结构与种子数据（已完成）

### 8. 推送 Drizzle Schema 到 MySQL

```bash
cd /Users/xiaojiang/web/demo-vuessr
npm run db:push
```

**等价命令：**

```bash
drizzle-kit push
```

**结果：** `[✓] Changes applied`（创建 users、posts、categories、tags 等全部表）

---

### 9. 填充种子数据

```bash
cd /Users/xiaojiang/web/demo-vuessr
npm run db:seed
```

**等价命令：**

```bash
tsx server/database/seed.ts
```

**结果：**
- ✅ 管理员：`admin / admin123`
- ✅ 4 个分类、5 个标签
- ✅ 示例文章：`welcome-to-my-blog`
- ✅ 站点 about/github/email 配置

---

## 四、启动开发服务器（已完成）

### 10. 检查 3000 端口是否占用

```bash
lsof -i :3000
```

**结果：** 端口空闲

---

### 11. 启动 Nuxt 开发服务

```bash
cd /Users/xiaojiang/web/demo-vuessr
npm run dev
```

**结果：**
- 开发服务器已在后台运行
- 本地地址：**http://localhost:3000**

---

## 五、启动验证（已通过）

### 12. 验证首页与 API

```bash
curl -s -o /dev/null -w "首页 HTTP %{http_code}\n" http://localhost:3000/
curl -s http://localhost:3000/api/posts | head -c 300
curl -s -o /dev/null -w "文章页 HTTP %{http_code}\n" http://localhost:3000/posts/welcome-to-my-blog
```

**结果：**
- 首页：`HTTP 200`
- API `/api/posts`：正常 JSON，含示例文章
- 文章详情页：`HTTP 200`

---

## 六、当前访问地址

| 页面 | 地址 |
|------|------|
| 博客首页 | http://localhost:3000 |
| 示例文章 | http://localhost:3000/posts/welcome-to-my-blog |
| 管理后台登录 | http://localhost:3000/admin/login |
| API 文章列表 | http://localhost:3000/api/posts |
| RSS | http://localhost:3000/rss.xml |
| Sitemap | http://localhost:3000/sitemap.xml |

**管理员账号：** `admin` / `admin123`

---

## 七、数据库连接信息汇总

| 用途 | 用户 | 密码 | 数据库 |
|------|------|------|--------|
| MySQL root（管理用） | root | 123456 | - |
| 应用连接（`.env`） | blog | blog123 | blog_db |

`.env` 文件内容（应用使用 blog 账号，**不是** root）：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=blog
DB_PASSWORD=blog123
DB_NAME=blog_db
```

---

## 八、你以后自己启动的步骤（精简版）

每次开发前，若 MySQL 未启动，按顺序执行：

```bash
# 1. 进入项目
cd /Users/xiaojiang/web/demo-vuessr

# 2. 启动 MySQL（若未运行）
brew services start mysql

# 3. 启动开发服务器
npm run dev
```

浏览器打开：http://localhost:3000

---

## 九、常用维护命令

```bash
# 停止开发服务器（在运行 npm run dev 的终端按 Ctrl+C）

# 停止 MySQL
brew services stop mysql

# 重新推送表结构（改 schema 后）
npm run db:push

# 重新填充种子数据（不会重复创建已存在的数据）
npm run db:seed

# 生产构建
npm run build
npm run preview
```

---

## 十、曾遇到的问题与处理

| 问题 | 原因 | 处理方式 |
|------|------|----------|
| Docker 不可用 | 本机未安装 Docker | 改用 Homebrew MySQL |
| root 无密码登录失败 | root 有密码 | 使用你提供的 `123456` |
| blog 用户不存在 | 未创建应用账号 | root 创建 `blog@localhost` |
| mysql_native_password 报错 | MySQL 9.6 默认插件不同 | 改用 `IDENTIFIED by 'blog123'` |
| npm install 较慢 | 网络/依赖多 | 此前已完成，本次未重复执行 |

---

## 11、本次未执行的命令（因已满足条件跳过）

以下命令**本次未再跑**，因为环境已就绪：

```bash
npm install          # node_modules 已存在
cp .env.example .env  # .env 已存在
docker compose up    # Docker 未安装
```

若在新机器上从零开始，需补跑：

```bash
npm install
cp .env.example .env
# 然后按本文档第二～四节执行
```

---

## 十二、停止当前正在运行的服务

开发服务器当前在后台运行。若要停止：

```bash
# 查找并结束 dev 进程
lsof -ti :3000 | xargs kill
```

或在 Cursor 终端面板中找到 `npm run dev` 进程按 `Ctrl+C`。
