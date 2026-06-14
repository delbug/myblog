import { getMenusForUser, apiSuccess } from '../../../utils'

/** GET /api/admin/menus - 当前用户可见的动态菜单 */
export default defineEventHandler(async (event) => {
  const menus = await getMenusForUser(event)
  return apiSuccess(menus)
})
