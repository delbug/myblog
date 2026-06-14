import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../database'
import { requireAdmin, slugify, apiSuccess, writeLog } from '../../../utils'

const { categories } = schema

const schema_ = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().optional(),
  description: z.string().max(200).optional(),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
})

/**
 * PUT /api/admin/categories/:id - 更新分类
 * DELETE /api/admin/categories/:id - 删除分类
 */
export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的分类 ID' })

  const db = useDb()

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const parsed = schema_.safeParse(body)
    if (!parsed.success) throw createError({ statusCode: 400, message: parsed.error.errors[0].message })

    const data = parsed.data
    await db.update(categories).set({
      ...data,
      slug: data.slug || slugify(data.name),
    }).where(eq(categories.id, id))

    await writeLog(event, { userId: admin.userId, username: admin.username, action: 'update', resource: 'category', resourceId: id })
    const [updated] = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
    return apiSuccess(updated, '分类已更新')
  }

  if (event.method === 'DELETE') {
    await db.delete(categories).where(eq(categories.id, id))
    await writeLog(event, { userId: admin.userId, username: admin.username, action: 'delete', resource: 'category', resourceId: id })
    return apiSuccess(null, '分类已删除')
  }
})
