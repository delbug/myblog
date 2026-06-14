# 使用教程

> 面向 **站点管理员** 和 **日常运营**：如何写文章、配置图床/搜索/统计、管理权限与回收站。  
> 开发者本地启动见 [STARTUP.md](./STARTUP.md)；读代码见 [ONBOARDING.md](./ONBOARDING.md)。

---

## 1. 登录后台

1. 打开 http://localhost:3000/admin/login  
2. 默认账号：`admin` / `admin123`（**生产环境部署后务必改密码**）  
3. 登录成功后进入仪表盘，左侧为动态菜单（按角色权限显示）

普通用户请在前台 `/login` 登录，无法进入后台。

---

## 2. 写文章

### 2.1 新建文章

路径：**文章管理 → 新建文章**（`/admin/posts/new`）

| 字段 | 说明 |
|------|------|
| 标题 | 必填 |
| URL Slug | 留空则根据标题自动生成 |
| 摘要 | 留空则从正文自动提取 |
| 分类 / 标签 | 可选 |
| 作者 | 多作者模式下可指定作者 |
| 封面图 | 上传或粘贴 URL |
| SEO 关键词 | 逗号分隔，利于搜索 |
| 正文 | Vditor / TipTap 双模式编辑器 |
| 置顶 | 首页优先展示 |

点击 **保存草稿** 或 **发布** 提交。

### 2.2 编辑器双模式

组件 `ArticleEditor` 支持切换：

- **Vditor**：经典 Markdown，工具栏 + 分屏预览，适合技术博客  
- **TipTap**：富文本 WYSIWYG，内部用 Turndown 转为 Markdown 存储  

文中插图：编辑器内点 📷 或 Vditor 上传，走 `/api/upload/image`。

### 2.3 编辑 / 删除

- **文章管理** 列表可搜索、分页、导出 CSV  
- **编辑** → `/admin/posts/:id`  
- **删除** → 移入 **回收站**（软删除，可恢复）

---

## 3. 回收站

路径：**回收站**（`/admin/posts/trash`）

| 操作 | 说明 |
|------|------|
| 恢复 | 文章回到正常列表 |
| 永久删除 | 从数据库删除，并同步移除搜索索引 |

需要权限：`post:restore` / `post:purge`。

---

## 4. 图片与图床

### 4.1 本地存储（默认）

`.env`：

```env
STORAGE_DRIVER=local
```

文件保存在 `public/uploads/`，URL 形如 `http://localhost:3000/uploads/xxx.png`。

### 4.2 阿里云 OSS

```env
STORAGE_DRIVER=aliyun
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=your-bucket
OSS_ACCESS_KEY=...
OSS_SECRET_KEY=...
OSS_CDN_URL=https://cdn.example.com   # 可选 CDN 域名
```

### 4.3 七牛云

```env
STORAGE_DRIVER=qiniu
QINIU_ACCESS_KEY=...
QINIU_SECRET_KEY=...
QINIU_BUCKET=your-bucket
QINIU_DOMAIN=https://cdn.example.com
```

### 4.4 Cloudinary

```env
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=blog/uploads   # 可选
```

未配置对应密钥时，系统自动 **回退本地存储** 并打日志警告。

---

## 5. 全文搜索

### 5.1 不配置 Meilisearch

搜索走 MySQL `LIKE`，接口 `GET /api/search?keyword=关键词`，前台 `/search` 可用。

### 5.2 启用 Meilisearch（推荐）

```bash
docker compose up meilisearch -d
```

`.env`：

```env
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=dev-master-key
```

首次或 bulk 导入后，在 **站点设置** 点 **重建 Meilisearch 索引**，或命令行：

```bash
npm run search:reindex
```

文章发布 / 更新 / 删除 / 永久删除时会 **自动同步索引**。

---

## 6. 多作者

- 前台 **作者** 导航 → `/authors` 列表  
- 作者详情 → `/authors/:username` 及其文章  
- 后台写文章时可下拉选择 **作者**  
- 文章卡片与详情页展示作者链接  

---

## 7. 角色与权限

路径：**角色权限**（`/admin/roles`）

- 按角色勾选权限码（如 `post:delete`、`comment:manage`）  
- 前台按钮用 `v-auth="'post:delete'"` 控制显示  
- 服务端 API 用 `requirePermission()` 二次校验  

路径：**菜单管理**（`/admin/menus`）

- 配置后台侧栏菜单项、图标、路径、所需权限码  
- 登录后按 `/api/admin/menus` 动态渲染侧栏  

---

## 8. 评论审核

路径：**评论管理**（`/admin/comments`）

- 新评论默认 `pending`  
- **通过** → 前台可见；**拒绝** → 隐藏  
- 前台支持 **嵌套回复**（树形展示 + @ 回复对象）

---

## 9. 站点设置与统计

路径：**站点设置**（`/admin/settings`）

| 配置项 | 用途 |
|--------|------|
| 关于介绍 / 邮箱 / GitHub | 关于页 `/about` |
| Google Analytics ID | 如 `G-XXXXXXXXXX` |
| 百度统计 ID | hm.js 中的站点 ID |

统计 ID 也可写在 `.env`：

```env
NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NUXT_PUBLIC_BAIDU_TONGJI_ID=your-site-id
```

后台保存的设置 **优先于** `.env`（插件启动时拉取 `/api/settings`）。

---

## 10. 阅读量与 Redis

高并发下阅读量先写 Redis，定时批量落库 MySQL。

```env
REDIS_URL=redis://localhost:6379
```

未配置时使用 **内存缓存**（单进程有效，开发够用）。

---

## 11. API 文档

后台 **API 文档**（`/admin/api-docs`）嵌入 Scalar，规范文件 `public/openapi.json`。

---

## 12. 测试与发布前检查

```bash
npm run build        # 构建必须通过
npm run test         # 单元测试
npm run test:e2e     # E2E（需 localhost:3000 已启动）
```

生产部署清单见 [DEPLOY.md](./DEPLOY.md)。

---

## 13. 常见问题

| 问题 | 处理 |
|------|------|
| 后台页 500 / getSSRProps | 确认 `plugins/auth-directive.ts` 存在（非 `.client.ts`） |
| 搜索无结果 | 检查 Meilisearch 是否运行；或重建索引 |
| 图片上传失败 | 检查 `STORAGE_DRIVER` 与对应密钥；看服务端日志 |
| 登录后进不了后台 | 账号 `role` 须为 `admin` |
| 中文搜索 API 400 | URL 需编码关键词；浏览器会自动处理 |

更多启动问题见 [STARTUP.md](./STARTUP.md) 第八节。
