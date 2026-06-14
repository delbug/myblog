import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../../../database'
import { requirePermission, apiSuccess, writeLog, cacheDel } from '../../../../utils'
import { removePostFromIndex } from '../../../../utils/meilisearch'

const { posts, postTags } = schema

/** DELETE /api/admin/posts/:id/permanent - 永久删除 */
export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, 'post:purge')
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的文章 ID' })

  const db = useDb()
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })
  if (!post.deletedAt) throw createError({ statusCode: 400, message: '请先将文章移入回收站' })

  await db.delete(postTags).where(eq(postTags.postId, id))
  await db.delete(posts).where(eq(posts.id, id))
  await cacheDel('posts:popular:1')
  await removePostFromIndex(id)

  await writeLog(event, {
    userId: user.userId,
    username: user.username,
    action: 'purge',
    resource: 'post',
    resourceId: id,
    detail: `永久删除文章 id=${id}`,
  })

  return apiSuccess(null, '文章已永久删除')
})
