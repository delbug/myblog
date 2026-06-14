import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../database'
import { requireAdmin, slugify, apiSuccess, zodFirstError } from '../../utils'

const { tags } = schema

const tagSchema = z.object({
  name: z.string().min(1, '标签名不能为空').max(30),
  slug: z.string().optional(),
})

/**
 * GET /api/tags - 获取所有标签
 * POST /api/tags - 创建标签（需登录）
 */
export default defineEventHandler(async (event) => {
  const db = useDb()

  if (event.method === 'GET') {
    const list = await db.select().from(tags).orderBy(tags.name)
    return apiSuccess(list)
  }

  if (event.method === 'POST') {
    requireAdmin(event)
    const body = await readBody(event)
    const parsed = tagSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: zodFirstError(parsed.error) })
    }

    const data = parsed.data
    const [result] = await db.insert(tags).values({
      name: data.name,
      slug: data.slug || slugify(data.name),
    })

    const [created] = await db.select().from(tags).where(eq(tags.id, result.insertId)).limit(1)
    return apiSuccess(created, '标签创建成功')
  }
})
