import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../database'
import { getAuthUser, apiSuccess } from '../../utils/auth'

const { users } = schema

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    return apiSuccess(null)
  }

  const db = useDb()
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatar: users.avatar,
      bio: users.bio,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1)

  return apiSuccess(user || null)
})
