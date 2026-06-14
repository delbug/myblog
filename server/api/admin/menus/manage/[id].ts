import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../../../database'
import { requirePermission, apiSuccess, zodFirstError } from '../../../../utils'

const { adminMenus } = schema

const menuSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  path: z.string().min(1).max(200).optional(),
  icon: z.string().max(20).nullable().optional(),
  permissionCode: z.string().max(100).nullable().optional(),
  sortOrder: z.number().optional(),
  enabled: z.number().optional(),
  parentId: z.number().nullable().optional(),
})

/**
 * PUT /api/admin/menus/manage/:id - 更新菜单
 * DELETE /api/admin/menus/manage/:id - 删除菜单
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'menu:manage')
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: '无效的菜单 ID' })

  const db = useDb()

  if (event.method === 'PUT') {
    const body = await readBody(event)
    const parsed = menuSchema.safeParse(body)
    if (!parsed.success) throw createError({ statusCode: 400, message: zodFirstError(parsed.error) })

    await db.update(adminMenus).set(parsed.data).where(eq(adminMenus.id, id))
    const [updated] = await db.select().from(adminMenus).where(eq(adminMenus.id, id)).limit(1)
    return apiSuccess(updated, '菜单已更新')
  }

  if (event.method === 'DELETE') {
    await db.delete(adminMenus).where(eq(adminMenus.id, id))
    return apiSuccess(null, '菜单已删除')
  }
})
