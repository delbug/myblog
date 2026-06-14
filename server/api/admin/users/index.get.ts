import { eq, desc, count } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../database'
import { requireAdmin, apiSuccess, parsePagination, writeLog } from '../../../utils'

const { users } = schema

/**
 * GET /api/admin/users - 用户列表
 * PUT /api/admin/users/:id - 更新用户状态/角色
 */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDb()

  if (event.method === 'GET') {
    const query = getQuery(event)
    const { page, pageSize, offset } = parsePagination(query as Record<string, unknown>)

    const [totalResult] = await db.select({ count: count() }).from(users)
    const list = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset)

    return apiSuccess({ list, total: totalResult?.count || 0, page, pageSize })
  }
})
