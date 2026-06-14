import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../database'
import { apiSuccess } from '../../utils/auth'

const { settings } = schema

/**
 * GET /api/settings - 获取站点公开配置
 * PUT /api/settings - 更新站点配置（需登录）
 */
export default defineEventHandler(async (event) => {
  const db = useDb()

  if (event.method === 'GET') {
    const rows = await db.select().from(settings)
    const result: Record<string, string> = {}
    for (const row of rows) {
      if (row.value) result[row.key] = row.value
    }
    return apiSuccess(result)
  }

  if (event.method === 'PUT') {
    const { requireAdmin } = await import('../../utils/auth')
    requireAdmin(event)

    const body = await readBody(event) as Record<string, string>

    for (const [key, value] of Object.entries(body)) {
      const [existing] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
      if (existing) {
        await db.update(settings).set({ value }).where(eq(settings.key, key))
      } else {
        await db.insert(settings).values({ key, value })
      }
    }

    return apiSuccess(null, '配置已更新')
  }
})
