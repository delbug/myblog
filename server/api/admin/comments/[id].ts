import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../../database'
import { requireAdmin, apiSuccess } from '../../../utils/auth'

const { comments } = schema

/**
 * PUT /api/admin/comments/:id - 更新评论状态
 * DELETE /api/admin/comments/:id - 删除评论
 */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的评论 ID' })

  const db = useDb()

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const status = body.status as 'pending' | 'approved' | 'rejected'
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw createError({ statusCode: 400, message: '无效的状态' })
    }

    await db.update(comments).set({ status }).where(eq(comments.id, id))
    return apiSuccess(null, '评论状态已更新')
  }

  if (event.method === 'DELETE') {
    await db.delete(comments).where(eq(comments.id, id))
    return apiSuccess(null, '评论已删除')
  }
})
