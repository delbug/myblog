import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../database'
import {
  requireAdmin, slugify, apiSuccess, extractSummary, renderMarkdown, writeLog, backupMarkdown, cacheDel,
} from '../../../utils'

const { posts, postTags } = schema

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().optional(),
  summary: z.string().max(500).optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().nullable().optional(),
  seoKeyword: z.string().max(200).nullable().optional(),
  status: z.enum(['draft', 'published']).optional(),
  categoryId: z.number().nullable().optional(),
  tagIds: z.array(z.number()).optional(),
  isTop: z.number().optional(),
  sortOrder: z.number().optional(),
})

/**
 * GET /api/admin/posts/:id - 获取文章详情
 * PUT /api/admin/posts/:id - 更新文章
 * DELETE /api/admin/posts/:id - 删除文章
 */
export default defineEventHandler(async (event) => {
  const user = requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的文章 ID' })

  const db = useDb()

  if (event.method === 'GET') {
    const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
    if (!post) throw createError({ statusCode: 404, message: '文章不存在' })
    const postTagList = await db.select().from(postTags).where(eq(postTags.postId, id))
    return apiSuccess({ ...post, tagIds: postTagList.map((pt) => pt.tagId) })
  }

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: parsed.error.errors[0].message })
    }

    const data = parsed.data
    const updateData: Record<string, unknown> = { ...data }
    delete updateData.tagIds

    if (data.title && !data.slug) updateData.slug = slugify(data.title)
    if (data.content) {
      if (!data.summary) updateData.summary = extractSummary(data.content)
      updateData.contentHtml = renderMarkdown(data.content)
    }
    if (data.status === 'published') {
      const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
      if (existing && !existing.publishedAt) updateData.publishedAt = new Date()
      if (data.content || existing?.content) {
        await backupMarkdown(
          (updateData.slug as string) || existing!.slug,
          (updateData.title as string) || existing!.title,
          (data.content || existing!.content),
        )
      }
    }

    await db.update(posts).set(updateData).where(eq(posts.id, id))
    await cacheDel('posts:popular:1')

    if (data.tagIds !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, id))
      if (data.tagIds.length) {
        await db.insert(postTags).values(data.tagIds.map((tagId) => ({ postId: id, tagId })))
      }
    }

    await writeLog(event, {
      userId: user.userId,
      username: user.username,
      action: 'update',
      resource: 'post',
      resourceId: id,
      detail: `更新文章 id=${id}`,
    })

    const [updated] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
    return apiSuccess(updated, '文章更新成功')
  }

  if (event.method === 'DELETE') {
    // 软删除：保留数据，前台不可见
    await db.update(posts).set({ deletedAt: new Date() }).where(eq(posts.id, id))
    await cacheDel('posts:popular:1')

    await writeLog(event, {
      userId: user.userId,
      username: user.username,
      action: 'delete',
      resource: 'post',
      resourceId: id,
      detail: `删除文章 id=${id}`,
    })

    return apiSuccess(null, '文章已移入回收站')
  }
})
