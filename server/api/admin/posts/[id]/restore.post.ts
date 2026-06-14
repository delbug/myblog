import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../../../database'
import { requirePermission, apiSuccess, writeLog, cacheDel } from '../../../../utils'
import { syncPostToIndex } from '../../../../utils/postIndex'

const { posts } = schema

/** POST /api/admin/posts/:id/restore - 从回收站恢复 */
export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, 'post:restore')
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的文章 ID' })

  const db = useDb()
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })
  if (!post.deletedAt) throw createError({ statusCode: 400, message: '文章不在回收站' })

  await db.update(posts).set({ deletedAt: null }).where(eq(posts.id, id))
  await cacheDel('posts:popular:1')
  await syncPostToIndex(id)

  await writeLog(event, {
    userId: user.userId,
    username: user.username,
    action: 'restore',
    resource: 'post',
    resourceId: id,
    detail: `恢复文章 id=${id}`,
  })

  return apiSuccess(null, '文章已恢复')
})
