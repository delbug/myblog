import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../database'
import { requireAdmin, apiSuccess, writeLog } from '../../../utils'

const { users } = schema

const updateSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'disabled']).optional(),
})

/**
 * PUT /api/admin/users/:id - 更新用户角色或状态
 */
export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的用户 ID' })

  if (id === admin.userId) {
    throw createError({ statusCode: 400, message: '不能修改自己的账号' })
  }

  const body = await readBody(event)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0].message })
  }

  const db = useDb()
  await db.update(users).set(parsed.data).where(eq(users.id, id))

  await writeLog(event, {
    userId: admin.userId,
    username: admin.username,
    action: 'update',
    resource: 'user',
    resourceId: id,
    detail: JSON.stringify(parsed.data),
  })

  const [updated] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return apiSuccess(updated, '用户已更新')
})
