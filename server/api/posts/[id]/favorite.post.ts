import { eq, and, isNull, sql } from 'drizzle-orm'
import { useDb, schema } from '../../../database'
import { requireAuth, apiSuccess } from '../../../utils'

const { postFavorites, posts } = schema

/** POST /api/posts/:id/favorite - 收藏/取消收藏 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const postId = Number(getRouterParam(event, 'id'))
  if (!postId) throw createError({ statusCode: 400, message: '无效的文章 ID' })

  const db = useDb()
  const [post] = await db.select().from(posts).where(and(eq(posts.id, postId), isNull(posts.deletedAt))).limit(1)
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  const [existing] = await db
    .select()
    .from(postFavorites)
    .where(and(eq(postFavorites.postId, postId), eq(postFavorites.userId, user.userId)))
    .limit(1)

  if (existing) {
    await db.delete(postFavorites).where(and(eq(postFavorites.postId, postId), eq(postFavorites.userId, user.userId)))
    await db.update(posts).set({ favoriteCount: sql`GREATEST(${posts.favoriteCount} - 1, 0)` }).where(eq(posts.id, postId))
    return apiSuccess({ favorited: false }, '已取消收藏')
  }

  await db.insert(postFavorites).values({ postId, userId: user.userId })
  await db.update(posts).set({ favoriteCount: sql`${posts.favoriteCount} + 1` }).where(eq(posts.id, postId))
  return apiSuccess({ favorited: true }, '收藏成功')
})
