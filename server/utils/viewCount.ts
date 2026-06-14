import { eq, sql } from 'drizzle-orm'
import { useDb, schema } from '../database'
import { cacheIncr, cacheGetNumber, cacheDel } from './cache'

const { posts } = schema
const VIEW_KEY = (id: number) => `post:view:${id}`
const FLUSH_EVERY = 10

/** 递增阅读量（Redis 缓冲，定期刷入 MySQL） */
export async function incrementPostView(postId: number): Promise<number> {
  const pending = await cacheIncr(VIEW_KEY(postId))

  if (pending >= FLUSH_EVERY) {
    await flushPostViewCount(postId)
    const db = useDb()
    const [row] = await db.select({ viewCount: posts.viewCount }).from(posts).where(eq(posts.id, postId)).limit(1)
    return row?.viewCount ?? pending
  }

  return getPostViewCount(postId)
}

/** 获取展示阅读量（DB + Redis 增量） */
export async function getPostViewCount(postId: number): Promise<number> {
  const db = useDb()
  const [row] = await db.select({ viewCount: posts.viewCount }).from(posts).where(eq(posts.id, postId)).limit(1)
  const pending = await cacheGetNumber(VIEW_KEY(postId))
  return (row?.viewCount ?? 0) + pending
}

/** 将缓冲阅读量刷入 MySQL */
export async function flushPostViewCount(postId: number) {
  const pending = await cacheGetNumber(VIEW_KEY(postId))
  if (pending <= 0) return

  const db = useDb()
  await db.update(posts).set({ viewCount: sql`${posts.viewCount} + ${pending}` }).where(eq(posts.id, postId))
  await cacheDel(VIEW_KEY(postId))
}
