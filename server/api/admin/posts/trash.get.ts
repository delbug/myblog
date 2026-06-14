import { desc, count, isNotNull } from 'drizzle-orm'
import { useDb, schema } from '../../../database'
import { requirePermission, apiSuccess, parsePagination } from '../../../utils'

const { posts } = schema

/** GET /api/admin/posts/trash - 回收站列表 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'post:restore')

  const query = getQuery(event)
  const { page, pageSize, offset } = parsePagination(query as Record<string, unknown>)
  const db = useDb()

  const whereClause = isNotNull(posts.deletedAt)
  const [totalResult] = await db.select({ count: count() }).from(posts).where(whereClause)
  const list = await db
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.deletedAt))
    .limit(pageSize)
    .offset(offset)

  return apiSuccess({ list, total: totalResult?.count || 0, page, pageSize })
})
