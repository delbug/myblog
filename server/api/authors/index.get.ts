import { eq, and, isNull, desc, count, sql } from 'drizzle-orm'
import { useDb, schema } from '../../database'
import { apiSuccess } from '../../utils'

const { users, posts } = schema

/** GET /api/authors - 已发布文章作者列表 */
export default defineEventHandler(async () => {
  const db = useDb()

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
      bio: users.bio,
      postCount: count(posts.id),
    })
    .from(users)
    .innerJoin(posts, eq(posts.authorId, users.id))
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))
    .groupBy(users.id)
    .orderBy(desc(sql`count(${posts.id})`))

  return apiSuccess(rows)
})
