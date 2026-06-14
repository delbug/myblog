import type { H3Event } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * 简单内存限流（IP + 路径维度）
 * @returns true 表示允许，false 表示被限流
 */
export function checkRateLimit(
  event: H3Event,
  options: { max: number; windowMs: number; key?: string },
): boolean {
  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getRequestHeader(event, 'x-real-ip')
    || 'unknown'
  const key = options.key || `${ip}:${event.path}`
  const now = Date.now()

  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return true
  }

  if (entry.count >= options.max) return false

  entry.count++
  return true
}

/** 限流中间件工厂 */
export function rateLimitMiddleware(max: number, windowMs: number) {
  return defineEventHandler((event) => {
    if (!checkRateLimit(event, { max, windowMs })) {
      throw createError({ statusCode: 429, message: '请求过于频繁，请稍后再试' })
    }
  })
}
