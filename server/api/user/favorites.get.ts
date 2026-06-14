import { eq, and, isNull, desc } from 'drizzle-orm'
import { useDb, schema } from '../../database'
import { requireAuth, apiSuccess, parsePagination } from '../../utils'

const { postFavorites, posts, categories } = schema

/** GET /api/user/favorites - 我的收藏列表 */
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const { page, pageSize, offset } = parsePagination(query as Record<string, unknown>)

  const db = useDb()
  const list = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      summary: posts.summary,
      coverImage: posts.coverImage,
      publishedAt: posts.publishedAt,
      categoryName: categories.name,
      favoritedAt: postFavorites.createdAt,
    })
    .from(postFavorites)
    .innerJoin(posts, eq(postFavorites.postId, posts.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(postFavorites.userId, user.userId), isNull(posts.deletedAt)))
    .orderBy(desc(postFavorites.createdAt))
    .limit(pageSize)
    .offset(offset)

  return apiSuccess({ list, page, pageSize })
})
