import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../database'
import { setAuthCookie, checkRateLimit, apiSuccess } from '../../utils/auth'
import { writeLog } from '../../utils/logger'
import { getClientIp } from '../../utils/auth'

const { users } = schema

const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(50),
  password: z.string().min(6, '密码至少6个字符').max(50),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
})

/**
 * POST /api/auth/register
 * 用户注册（默认 role=user）
 */
export default defineEventHandler(async (event) => {
  if (!checkRateLimit(event, { max: 5, windowMs: 60_000, key: `register:${event.path}` })) {
    throw createError({ statusCode: 429, message: '注册过于频繁，请稍后再试' })
  }

  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0].message })
  }

  const { username, password, email } = parsed.data
  const db = useDb()

  const [existing] = await db.select().from(users).where(eq(users.username, username)).limit(1)
  if (existing) {
    throw createError({ statusCode: 409, message: '用户名已存在' })
  }

  if (email) {
    const [emailExists] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (emailExists) {
      throw createError({ statusCode: 409, message: '邮箱已被注册' })
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const [result] = await db.insert(users).values({
    username,
    passwordHash,
    email: email || null,
    role: 'user',
    status: 'active',
  })

  const payload = { userId: result.insertId, username, role: 'user' as const }
  setAuthCookie(event, payload)

  await writeLog(event, {
    userId: result.insertId,
    username,
    action: 'register',
    resource: 'user',
    resourceId: result.insertId,
    detail: `用户注册 ip=${getClientIp(event)}`,
  })

  return apiSuccess({
    id: result.insertId,
    username,
    email: email || null,
    role: 'user',
  }, '注册成功')
})
