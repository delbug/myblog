import { useDb, schema } from '../../../database'
import { requirePermission, apiSuccess, getRolePermissions } from '../../../utils'
import type { UserRole } from '../../../database/schema'

const { permissions } = schema

const ROLES: UserRole[] = ['admin', 'user']

/** GET /api/admin/roles - 各角色权限列表 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'role:manage')
  const db = useDb()

  const allPerms = await db.select().from(permissions).orderBy(permissions.groupName)
  const result: Record<string, { permissions: typeof allPerms; codes: string[] }> = {}

  for (const role of ROLES) {
    const codes = [...(await getRolePermissions(role))]
    result[role] = {
      permissions: allPerms,
      codes,
    }
  }

  return apiSuccess({ roles: ROLES, allPermissions: allPerms, rolePermissions: result })
})
