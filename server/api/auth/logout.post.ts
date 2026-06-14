import { clearAuthCookie, apiSuccess } from '../../utils/auth'

/**
 * POST /api/auth/logout
 * 退出登录，清除 Cookie
 */
export default defineEventHandler(async (event) => {
  clearAuthCookie(event)
  return apiSuccess(null, '已退出登录')
})
