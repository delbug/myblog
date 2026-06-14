import { eq, and, isNull, sql } from 'drizzle-orm'
import { useDb, schema } from '../../../database'
import { requireAuth, apiSuccess } from '../../../utils'

const { postLikes, posts } = schema

/** POST /api/posts/:id/like - 点赞/取消点赞 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const postId = Number(getRouterParam(event, 'id'))
  if (!postId) throw createError({ statusCode: 400, message: '无效的文章 ID' })

  const db = useDb()
  const [post] = await db.select().from(posts).where(and(eq(posts.id, postId), isNull(posts.deletedAt))).limit(1)
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  const [existing] = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.userId)))
    .limit(1)

  if (existing) {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.userId)))
    await db.update(posts).set({ likeCount: sql`GREATEST(${posts.likeCount} - 1, 0)` }).where(eq(posts.id, postId))
    return apiSuccess({ liked: false }, '已取消点赞')
  }

  await db.insert(postLikes).values({ postId, userId: user.userId })
  await db.update(posts).set({ likeCount: sql`${posts.likeCount} + 1` }).where(eq(posts.id, postId))
  return apiSuccess({ liked: true }, '点赞成功')
})
