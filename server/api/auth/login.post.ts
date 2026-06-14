import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../database'
import { setAuthCookie, getClientIp, checkRateLimit, apiSuccess } from '../../utils/auth'
import { writeLog } from '../../utils/logger'

const { users } = schema

const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

/** POST /api/auth/login - 统一登录 */
export default defineEventHandler(async (event) => {
  if (!checkRateLimit(event, { max: 10, windowMs: 60_000, key: `login:${event.path}` })) {
    throw createError({ statusCode: 429, message: '登录尝试过于频繁，请稍后再试' })
  }

  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0].message })
  }

  const { username, password } = parsed.data
  const db = useDb()
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)

  if (!user) throw createError({ statusCode: 401, message: '用户名或密码错误' })
  if (user.status === 'disabled') throw createError({ statusCode: 403, message: '账号已被禁用' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw createError({ statusCode: 401, message: '用户名或密码错误' })

  const role = user.role as 'admin' | 'user'
  setAuthCookie(event, { userId: user.id, username: user.username, role })

  await writeLog(event, {
    userId: user.id,
    username: user.username,
    action: 'login',
    resource: 'user',
    resourceId: user.id,
    detail: `用户登录 role=${role} ip=${getClientIp(event)}`,
  })

  return apiSuccess({ id: user.id, username: user.username, email: user.email, avatar: user.avatar, role })
})
