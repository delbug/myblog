import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import type { UserRole } from '../database/schema'

export interface JwtPayload {
  userId: number
  username: string
  role: UserRole
}

const COOKIE_NAME = 'blog_token'

/**
 * 签发 JWT 并写入 HttpOnly Cookie
 */
export function setAuthCookie(event: H3Event, payload: JwtPayload) {
  const config = useRuntimeConfig()
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

/** 清除登录 Cookie */
export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

/** 从 Cookie 解析当前登录用户 */
export function getAuthUser(event: H3Event): JwtPayload | null {
  const config = useRuntimeConfig()
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null

  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload
  } catch {
    return null
  }
}

/** 要求必须登录，否则抛出 401 */
export function requireAuth(event: H3Event): JwtPayload {
  const user = getAuthUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: '请先登录' })
  }
  return user
}

/** 要求管理员权限，否则抛出 403 */
export function requireAdmin(event: H3Event): JwtPayload {
  const user = requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, message: '需要管理员权限' })
  }
  return user
}

/** 获取客户端 IP */
export function getClientIp(event: H3Event): string {
  return getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getRequestHeader(event, 'x-real-ip')
    || 'unknown'
}

/** Zod 校验失败时的首条错误信息（Zod 4 使用 issues） */
export function zodFirstError(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? '参数校验失败'
}

/** 将字符串转为 URL 友好的 slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `post-${Date.now()}`
}

/** 统一 API 成功响应格式 */
export function apiSuccess<T>(data: T, message = 'ok') {
  return { code: 0, message, data }
}

/** 统一 API 错误响应 */
export function apiError(message: string, statusCode = 400) {
  throw createError({ statusCode, message })
}

export { checkRateLimit } from './rateLimit'

/** 解析分页参数 */
export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10))
  const offset = (page - 1) * pageSize
  return { page, pageSize, offset }
}
