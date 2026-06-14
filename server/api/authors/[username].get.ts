import { eq, and, isNull, count } from 'drizzle-orm'
import { useDb, schema } from '../../database'
import { apiSuccess, parsePagination } from '../../utils'
import { getPublishedPosts } from '../../utils/post'

const { users, posts } = schema

/** GET /api/authors/:username - 作者资料 + 文章列表 */
export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  if (!username) throw createError({ statusCode: 400, message: '缺少用户名' })

  const db = useDb()
  const [author] = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (!author) throw createError({ statusCode: 404, message: '作者不存在' })

  const query = getQuery(event)
  const { page, pageSize } = parsePagination(query as Record<string, unknown>)

  const [countRow] = await db
    .select({ count: count() })
    .from(posts)
    .where(and(eq(posts.authorId, author.id), eq(posts.status, 'published'), isNull(posts.deletedAt)))

  const result = await getPublishedPosts({ page, pageSize, authorId: author.id, orderBy: 'latest' })

  return apiSuccess({
    author: {
      id: author.id,
      username: author.username,
      avatar: author.avatar,
      bio: author.bio,
      postCount: countRow?.count || 0,
    },
    ...result,
  })
})
