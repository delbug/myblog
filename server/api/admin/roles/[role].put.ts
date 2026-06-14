import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../database'
import { requirePermission, apiSuccess, zodFirstError, clearPermCache, writeLog } from '../../../utils'
import type { UserRole } from '../../../database/schema'

const { permissions, rolePermissions } = schema

const updateSchema = z.object({
  permissionCodes: z.array(z.string()),
})

/** PUT /api/admin/roles/:role - 更新角色权限 */
export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, 'role:manage')
  const role = getRouterParam(event, 'role') as UserRole
  if (role !== 'admin' && role !== 'user') {
    throw createError({ statusCode: 400, message: '无效的角色' })
  }

  const body = await readBody(event)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: zodFirstError(parsed.error) })

  const db = useDb()
  const allPerms = await db.select().from(permissions)
  const permMap = new Map(allPerms.map((p) => [p.code, p.id]))

  await db.delete(rolePermissions).where(eq(rolePermissions.role, role))

  for (const code of parsed.data.permissionCodes) {
    const permId = permMap.get(code)
    if (permId) {
      await db.insert(rolePermissions).values({ role, permissionId: permId })
    }
  }

  clearPermCache()

  await writeLog(event, {
    userId: user.userId,
    username: user.username,
    action: 'update',
    resource: 'role',
    detail: `更新角色 ${role} 权限: ${parsed.data.permissionCodes.join(', ')}`,
  })

  return apiSuccess({ role, permissionCodes: parsed.data.permissionCodes }, '角色权限已更新')
})
