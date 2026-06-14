import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { eq } from 'drizzle-orm'
import * as schema from './schema'

const { users, categories, tags, posts, postTags, settings } = schema

/**
 * 创建独立数据库连接（供 seed 脚本使用，不依赖 Nuxt 运行时）
 */
function createDb() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'blog',
    password: process.env.DB_PASSWORD || 'blog123',
    database: process.env.DB_NAME || 'blog_db',
    waitForConnections: true,
    connectionLimit: 5,
  })
  return drizzle(pool, { schema, mode: 'default' })
}

/**
 * 初始化种子数据
 * 创建默认管理员、分类、标签和示例文章
 */
async function seed() {
  const db = createDb()

  console.log('🌱 开始填充种子数据...')

  const passwordHash = await bcrypt.hash('admin123', 10)
  const [existingUser] = await db.select().from(users).where(eq(users.username, 'admin')).limit(1)

  let adminId: number
  if (!existingUser) {
    const [result] = await db.insert(users).values({
      username: 'admin',
      passwordHash,
      email: 'admin@example.com',
      bio: '博客管理员',
      role: 'admin',
      status: 'active',
    })
    adminId = result.insertId
    console.log('✅ 创建管理员账号: admin / admin123')
  } else {
    adminId = existingUser.id
    // 确保已有 admin 账号具备管理员角色
    if (existingUser.role !== 'admin') {
      await db.update(users).set({ role: 'admin' }).where(eq(users.username, 'admin'))
    }
    console.log('ℹ️  管理员已存在，跳过')
  }

  const categoryData = [
    { name: '前端开发', slug: 'frontend', description: 'Vue、React、CSS 等前端技术' },
    { name: '后端开发', slug: 'backend', description: 'Node.js、数据库、API 设计' },
    { name: 'DevOps', slug: 'devops', description: '部署、Docker、CI/CD' },
    { name: '生活随笔', slug: 'life', description: '个人思考与生活记录' },
  ]

  for (const cat of categoryData) {
    const [existing] = await db.select().from(categories).where(eq(categories.slug, cat.slug)).limit(1)
    if (!existing) await db.insert(categories).values(cat)
  }
  console.log('✅ 分类数据就绪')

  const tagData = [
    { name: 'Vue', slug: 'vue' },
    { name: 'Nuxt', slug: 'nuxt' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'MySQL', slug: 'mysql' },
    { name: 'SEO', slug: 'seo' },
  ]

  for (const tag of tagData) {
    const [existing] = await db.select().from(tags).where(eq(tags.slug, tag.slug)).limit(1)
    if (!existing) await db.insert(tags).values(tag)
  }
  console.log('✅ 标签数据就绪')

  const [existingPost] = await db.select().from(posts).where(eq(posts.slug, 'welcome-to-my-blog')).limit(1)
  if (!existingPost) {
    const [frontendCat] = await db.select().from(categories).where(eq(categories.slug, 'frontend')).limit(1)
    const allTags = await db.select().from(tags)

    const [postResult] = await db.insert(posts).values({
      title: '欢迎来到我的博客',
      slug: 'welcome-to-my-blog',
      summary: '这是一篇示例文章，介绍如何使用 Nuxt 3 + MySQL 搭建支持 SEO 的个人博客。',
      content: `# 欢迎来到我的博客

这是一篇 **Markdown** 格式的示例文章。

## 功能特性

- ✅ SSR 服务端渲染，SEO 友好
- ✅ Markdown 写作，代码高亮
- ✅ 分类、标签、搜索
- ✅ 评论系统
- ✅ 管理后台

## 代码示例

\`\`\`javascript
const { data: posts } = await useFetch('/api/posts')
console.log(posts.value)
\`\`\`

## 下一步

登录管理后台，使用 admin / admin123 开始写作吧！
`,
      status: 'published',
      authorId: adminId,
      categoryId: frontendCat?.id,
      publishedAt: new Date(),
      viewCount: 0,
      isTop: 1,
    })

    const postId = postResult.insertId
    for (const slug of ['vue', 'nuxt', 'seo']) {
      const tag = allTags.find((t) => t.slug === slug)
      if (tag) await db.insert(postTags).values({ postId, tagId: tag.id })
    }
    console.log('✅ 创建示例文章')
  }

  const settingsData = [
    { key: 'about', value: '你好，我是一名全栈开发者，热爱开源与技术分享。这个博客使用 Nuxt 3 + MySQL 构建，支持 SSR 和 SEO。' },
    { key: 'github', value: 'https://github.com' },
    { key: 'email', value: 'admin@example.com' },
  ]

  for (const setting of settingsData) {
    const [existing] = await db.select().from(settings).where(eq(settings.key, setting.key)).limit(1)
    if (!existing) await db.insert(settings).values(setting)
  }
  console.log('✅ 站点配置就绪')

  const { seedPermissions } = await import('../utils/permission')
  await seedPermissions()
  console.log('✅ 权限数据就绪')

  const { seedAdminMenus } = await import('../utils/menus')
  await seedAdminMenus()
  console.log('✅ 后台菜单就绪')

  const { rebuildPostIndex } = await import('../utils/postIndex')
  try {
    const { indexed } = await rebuildPostIndex()
    if (indexed > 0) console.log(`✅ 搜索索引就绪 (${indexed} 篇)`)
  } catch {
    console.log('ℹ️  Meilisearch 未配置，跳过索引')
  }

  console.log('🎉 种子数据填充完成！')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ 种子数据填充失败:', err)
  process.exit(1)
})
