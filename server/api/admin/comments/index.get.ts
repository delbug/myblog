import { eq, desc } from 'drizzle-orm'
import { useDb, schema } from '../../../database'
import { requireAdmin, apiSuccess } from '../../../utils/auth'

const { comments, posts } = schema

/**
 * GET /api/admin/comments - 获取所有评论（管理端）
 * PUT /api/admin/comments/:id - 审核评论
 * DELETE /api/admin/comments/:id - 删除评论
 */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDb()

  if (event.path.endsWith('/comments') && event.method === 'GET') {
    const list = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        postTitle: posts.title,
        parentId: comments.parentId,
        authorName: comments.authorName,
        authorEmail: comments.authorEmail,
        content: comments.content,
        status: comments.status,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .leftJoin(posts, eq(comments.postId, posts.id))
      .orderBy(desc(comments.createdAt))

    return apiSuccess(list)
  }
})
