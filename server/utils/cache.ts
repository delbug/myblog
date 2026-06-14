/**
 * 缓存层：优先 Redis，无 Redis 时使用内存 Map
 */
const memoryCache = new Map<string, { value: string; expireAt: number }>()

let redisClient: { get: (k: string) => Promise<string | null>; setex: (k: string, ttl: number, v: string) => Promise<void>; del: (k: string) => Promise<void> } | null = null

/** 懒加载 Redis 客户端 */
async function getRedis() {
  if (redisClient !== null) return redisClient
  const url = process.env.REDIS_URL
  if (!url) return null

  try {
    const { default: Redis } = await import('ioredis')
    const client = new Redis(url)
    redisClient = {
      get: (k) => client.get(k),
      setex: (k, ttl, v) => client.setex(k, ttl, v).then(() => {}),
      del: (k) => client.del(k).then(() => {}),
    }
    return redisClient
  } catch {
    console.warn('[cache] Redis 连接失败，使用内存缓存')
    return null
  }
}

/** 读取缓存 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis()
  if (redis) {
    const raw = await redis.get(key)
    return raw ? JSON.parse(raw) : null
  }

  const entry = memoryCache.get(key)
  if (!entry || Date.now() > entry.expireAt) {
    memoryCache.delete(key)
    return null
  }
  return JSON.parse(entry.value)
}

/** 写入缓存（秒） */
export async function cacheSet(key: string, value: unknown, ttlSec = 300) {
  const raw = JSON.stringify(value)
  const redis = await getRedis()
  if (redis) {
    await redis.setex(key, ttlSec, raw)
    return
  }
  memoryCache.set(key, { value: raw, expireAt: Date.now() + ttlSec * 1000 })
}

/** 删除缓存 */
export async function cacheDel(key: string) {
  const redis = await getRedis()
  if (redis) {
    await redis.del(key)
    return
  }
  memoryCache.delete(key)
}
