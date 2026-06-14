import { getAuthUser, apiSuccess } from '../../utils/auth'
import { getRolePermissions } from '../../utils/permission'

/** GET /api/auth/permissions - 获取当前用户权限码列表 */
export default defineEventHandler(async (event) => {
  const user = getAuthUser(event)
  if (!user) return apiSuccess([])

  const perms = await getRolePermissions(user.role)
  return apiSuccess([...perms])
})
