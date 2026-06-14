import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../database'
import { requireAdmin, slugify, apiSuccess, writeLog, zodFirstError } from '../../../utils'

const { tags } = schema

const tagSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z.string().optional(),
})

/**
 * PUT /api/admin/tags/:id - 更新标签
 * DELETE /api/admin/tags/:id - 删除标签
 */
export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的标签 ID' })

  const db = useDb()

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const parsed = tagSchema.safeParse(body)
    if (!parsed.success) throw createError({ statusCode: 400, message: zodFirstError(parsed.error) })

    await db.update(tags).set({
      name: parsed.data.name,
      slug: parsed.data.slug || slugify(parsed.data.name),
    }).where(eq(tags.id, id))

    await writeLog(event, { userId: admin.userId, username: admin.username, action: 'update', resource: 'tag', resourceId: id })
    const [updated] = await db.select().from(tags).where(eq(tags.id, id)).limit(1)
    return apiSuccess(updated, '标签已更新')
  }

  if (event.method === 'DELETE') {
    await db.delete(tags).where(eq(tags.id, id))
    await writeLog(event, { userId: admin.userId, username: admin.username, action: 'delete', resource: 'tag', resourceId: id })
    return apiSuccess(null, '标签已删除')
  }
})
