import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../database'
import { requireAdmin, slugify, apiSuccess, zodFirstError } from '../../utils'

const { categories } = schema

const categorySchema = z.object({
  name: z.string().min(1, '分类名不能为空').max(50),
  slug: z.string().optional(),
  description: z.string().max(200).optional(),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
})

/**
 * GET /api/categories - 获取所有分类
 * POST /api/categories - 创建分类（需登录）
 */
export default defineEventHandler(async (event) => {
  const db = useDb()

  if (event.method === 'GET') {
    const list = await db.select().from(categories).orderBy(categories.name)
    return apiSuccess(list)
  }

  if (event.method === 'POST') {
    requireAdmin(event)
    const body = await readBody(event)
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: zodFirstError(parsed.error) })
    }

    const data = parsed.data
    const [result] = await db.insert(categories).values({
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      parentId: data.parentId || null,
      sortOrder: data.sortOrder || 0,
    })

    const [created] = await db.select().from(categories).where(eq(categories.id, result.insertId)).limit(1)
    return apiSuccess(created, '分类创建成功')
  }
})
