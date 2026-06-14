import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { requirePermission, apiSuccess, zodFirstError } from '../../../../utils'
import { useDb, schema } from '../../../../database'

const { adminMenus } = schema

const menuSchema = z.object({
  label: z.string().min(1).max(50),
  path: z.string().min(1).max(200),
  icon: z.string().max(20).optional(),
  permissionCode: z.string().max(100).nullable().optional(),
  sortOrder: z.number().optional(),
  enabled: z.number().optional(),
  parentId: z.number().nullable().optional(),
})

/**
 * GET /api/admin/menus/manage - 全部菜单（管理用）
 * POST /api/admin/menus/manage - 新建菜单
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'menu:manage')
  const db = useDb()

  if (event.method === 'GET') {
    const list = await db.select().from(adminMenus).orderBy(adminMenus.sortOrder)
    return apiSuccess(list)
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const parsed = menuSchema.safeParse(body)
    if (!parsed.success) throw createError({ statusCode: 400, message: zodFirstError(parsed.error) })

    const [result] = await db.insert(adminMenus).values({
      label: parsed.data.label,
      path: parsed.data.path,
      icon: parsed.data.icon ?? null,
      permissionCode: parsed.data.permissionCode ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      enabled: parsed.data.enabled ?? 1,
      parentId: parsed.data.parentId ?? null,
    })

    const [created] = await db.select().from(adminMenus).where(eq(adminMenus.id, result.insertId)).limit(1)
    return apiSuccess(created, '菜单创建成功')
  }
})
