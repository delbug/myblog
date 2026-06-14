import { eq, desc, and, sql, count, inArray, isNull } from 'drizzle-orm'
import { useDb, schema } from '../database'
import { renderMarkdown } from './markdown'
import { cacheGet, cacheSet } from './cache'

const { posts, categories, tags, postTags, users, comments } = schema

/** 公开文章基础条件：已发布 + 未软删除 */
function publishedCondition() {
  return and(eq(posts.status, 'published'), isNull(posts.deletedAt))
}

export interface PostListItem {
  id: number
  title: string
  slug: string
  summary: string | null
  coverImage: string | null
  viewCount: number
  isTop: number
  publishedAt: Date | null
  createdAt: Date
  category: { id: number; name: string; slug: string } | null
  tags: { id: number; name: string; slug: string }[]
  author: { id: number; username: string; avatar: string | null }
}

/**
 * 查询文章列表（公开页，仅已发布）
 */
export async function getPublishedPosts(options: {
  page?: number
  pageSize?: number
  categorySlug?: string
  tagSlug?: string
  keyword?: string
  orderBy?: 'latest' | 'popular'
}) {
  const db = useDb()
  const page = options.page || 1
  const pageSize = options.pageSize || 10
  const offset = (page - 1) * pageSize

  const conditions = [publishedCondition()]

  // 热门文章走缓存
  if (options.orderBy === 'popular' && !options.keyword && !options.categorySlug && !options.tagSlug && page === 1) {
    const cached = await cacheGet<{ list: PostListItem[]; total: number }>('posts:popular:1')
    if (cached) return { ...cached, page, pageSize }
  }

  if (options.categorySlug) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, options.categorySlug)).limit(1)
    if (cat) conditions.push(eq(posts.categoryId, cat.id))
  }

  if (options.tagSlug) {
    const [tag] = await db.select().from(tags).where(eq(tags.slug, options.tagSlug)).limit(1)
    if (tag) {
      const taggedPosts = await db.select({ postId: postTags.postId }).from(postTags).where(eq(postTags.tagId, tag.id))
      const postIds = taggedPosts.map((p) => p.postId)
      if (postIds.length === 0) return { list: [], total: 0, page, pageSize }
      conditions.push(inArray(posts.id, postIds))
    }
  }

  if (options.keyword) {
    conditions.push(
      sql`(${posts.title} LIKE ${`%${options.keyword}%`} OR ${posts.summary} LIKE ${`%${options.keyword}%`} OR ${posts.content} LIKE ${`%${options.keyword}%`} OR ${posts.seoKeyword} LIKE ${`%${options.keyword}%`})`,
    )
  }

  const whereClause = and(...conditions)

  const [totalResult] = await db.select({ count: count() }).from(posts).where(whereClause)
  const total = totalResult?.count || 0

  const orderColumn = options.orderBy === 'popular' ? desc(posts.viewCount) : desc(posts.publishedAt)

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      summary: posts.summary,
      coverImage: posts.coverImage,
      viewCount: posts.viewCount,
      isTop: posts.isTop,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorUsername: users.username,
      authorAvatar: users.avatar,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(whereClause)
    .orderBy(desc(posts.isTop), orderColumn)
    .limit(pageSize)
    .offset(offset)

  const list = await enrichPostsWithTags(rows)

  if (options.orderBy === 'popular' && !options.keyword && !options.categorySlug && !options.tagSlug && page === 1) {
    await cacheSet('posts:popular:1', { list, total }, 300)
  }

  return { list, total, page, pageSize }
}

/**
 * 根据 slug 获取单篇文章详情
 */
export async function getPostBySlug(slug: string, incrementView = true) {
  const db = useDb()

  const [row] = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      summary: posts.summary,
      content: posts.content,
      contentHtml: posts.contentHtml,
      coverImage: posts.coverImage,
      viewCount: posts.viewCount,
      likeCount: posts.likeCount,
      favoriteCount: posts.favoriteCount,
      seoKeyword: posts.seoKeyword,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      authorId: users.id,
      authorUsername: users.username,
      authorAvatar: users.avatar,
      authorBio: users.bio,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.slug, slug), publishedCondition()))
    .limit(1)

  if (!row) return null

  if (incrementView) {
    await db.update(posts).set({ viewCount: sql`${posts.viewCount} + 1` }).where(eq(posts.id, row.id))
    row.viewCount += 1
  }

  const postTagsList = await db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, row.id))

  const commentCount = await db
    .select({ count: count() })
    .from(comments)
    .where(and(eq(comments.postId, row.id), eq(comments.status, 'approved')))

  return {
    ...row,
    htmlContent: row.contentHtml || renderMarkdown(row.content),
    tags: postTagsList,
    commentCount: commentCount[0]?.count || 0,
    category: row.categoryId
      ? { id: row.categoryId, name: row.categoryName!, slug: row.categorySlug! }
      : null,
    author: {
      id: row.authorId,
      username: row.authorUsername!,
      avatar: row.authorAvatar,
      bio: row.authorBio,
    },
  }
}

/**
 * 获取相关文章（同分类或同标签）
 */
export async function getRelatedPosts(postId: number, categoryId: number | null, limit = 5) {
  const db = useDb()
  const conditions = [publishedCondition(), sql`${posts.id} != ${postId}`]

  if (categoryId) {
    conditions.push(eq(posts.categoryId, categoryId))
  }

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      summary: posts.summary,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt))
    .limit(limit)

  return rows
}

/**
 * 获取归档数据（按年月分组）
 */
export async function getArchive() {
  const db = useDb()

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(publishedCondition())
    .orderBy(desc(posts.publishedAt))

  const grouped: Record<string, typeof rows> = {}
  for (const post of rows) {
    const date = post.publishedAt || new Date()
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(post)
  }

  return grouped
}

/** 为文章列表附加标签信息 */
async function enrichPostsWithTags(
  rows: Array<{
    id: number
    title: string
    slug: string
    summary: string | null
    coverImage: string | null
    viewCount: number
    isTop: number
    publishedAt: Date | null
    createdAt: Date
    categoryId: number | null
    categoryName: string | null
    categorySlug: string | null
    authorId: number
    authorUsername: string | null
    authorAvatar: string | null
  }>,
): Promise<PostListItem[]> {
  if (rows.length === 0) return []

  const db = useDb()
  const postIds = rows.map((r) => r.id)

  const allPostTags = await db
    .select({
      postId: postTags.postId,
      tagId: tags.id,
      tagName: tags.name,
      tagSlug: tags.slug,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds))

  const tagsByPost: Record<number, { id: number; name: string; slug: string }[]> = {}
  for (const pt of allPostTags) {
    if (!tagsByPost[pt.postId]) tagsByPost[pt.postId] = []
    tagsByPost[pt.postId].push({ id: pt.tagId, name: pt.tagName, slug: pt.tagSlug })
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    coverImage: row.coverImage,
    viewCount: row.viewCount,
    isTop: row.isTop,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    category: row.categoryId
      ? { id: row.categoryId, name: row.categoryName!, slug: row.categorySlug! }
      : null,
    tags: tagsByPost[row.id] || [],
    author: {
      id: row.authorId,
      username: row.authorUsername || '匿名',
      avatar: row.authorAvatar,
    },
  }))
}

/**
 * 获取所有已发布文章的 slug（供 sitemap 使用）
 */
export async function getAllPublishedSlugs() {
  const db = useDb()
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(publishedCondition())
    .orderBy(desc(posts.publishedAt))
}
