import { eq, desc, count, and, sql, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../database'
import {
  requireAdmin, slugify, apiSuccess, parsePagination, extractSummary, renderMarkdown, writeLog, backupMarkdown, cacheDel,
} from '../../../utils'

const { posts, postTags } = schema

const postSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  slug: z.string().optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1, '内容不能为空'),
  coverImage: z.string().optional(),
  seoKeyword: z.string().max(200).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  categoryId: z.number().nullable().optional(),
  tagIds: z.array(z.number()).optional(),
  isTop: z.number().optional(),
  sortOrder: z.number().optional(),
})

/**
 * GET /api/admin/posts - 管理端文章列表（含草稿）
 * POST /api/admin/posts - 创建文章
 */
export default defineEventHandler(async (event) => {
  const user = requireAdmin(event)
  const db = useDb()

  if (event.method === 'GET') {
    const query = getQuery(event)
    const { page, pageSize, offset } = parsePagination(query as Record<string, unknown>)
    const status = query.status as string | undefined
    const keyword = query.keyword as string | undefined

    const conditions = []
    if (status) conditions.push(eq(posts.status, status as 'draft' | 'published'))
    if (keyword) conditions.push(sql`${posts.title} LIKE ${`%${keyword}%`}`)
    conditions.push(isNull(posts.deletedAt))
    const whereClause = conditions.length ? and(...conditions) : undefined

    const [totalResult] = await db.select({ count: count() }).from(posts).where(whereClause)
    const list = await db.select().from(posts).where(whereClause).orderBy(desc(posts.createdAt)).limit(pageSize).offset(offset)

    return apiSuccess({ list, total: totalResult?.count || 0, page, pageSize })
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.errors[0].message })
    }

    const data = parsed.data
    const slug = data.slug || slugify(data.title)
    const summary = data.summary || extractSummary(data.content)
    const contentHtml = renderMarkdown(data.content)

    const [result] = await db.insert(posts).values({
      title: data.title,
      slug,
      summary,
      content: data.content,
      contentHtml,
      coverImage: data.coverImage || null,
      seoKeyword: data.seoKeyword || null,
      status: data.status,
      categoryId: data.categoryId || null,
      authorId: user.userId,
      isTop: data.isTop || 0,
      sortOrder: data.sortOrder || 0,
      publishedAt: data.status === 'published' ? new Date() : null,
    })

    const postId = result.insertId
    if (data.tagIds?.length) {
      await db.insert(postTags).values(data.tagIds.map((tagId) => ({ postId, tagId })))
    }

    if (data.status === 'published') {
      await backupMarkdown(slug, data.title, data.content)
    }

    await writeLog(event, {
      userId: user.userId,
      username: user.username,
      action: 'create',
      resource: 'post',
      resourceId: postId,
      detail: `创建文章: ${data.title}`,
    })

    const [created] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
    await cacheDel('posts:popular:1')
    return apiSuccess(created, '文章创建成功')
  }
})
