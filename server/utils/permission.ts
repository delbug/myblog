import type { H3Event } from 'h3'
import { eq, and } from 'drizzle-orm'
import { useDb, schema } from '../database'
import { requireAuth } from './auth'
import type { PermissionCode, UserRole } from '../database/schema'

const { permissions, rolePermissions } = schema

/** 内存缓存角色权限，避免频繁查库 */
const permCache = new Map<UserRole, Set<string>>()

/**
 * 获取某角色拥有的权限码列表
 */
export async function getRolePermissions(role: UserRole): Promise<Set<string>> {
  if (permCache.has(role)) return permCache.get(role)!

  const db = useDb()
  const rows = await db
    .select({ code: permissions.code })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.role, role))

  const set = new Set(rows.map((r) => r.code))
  permCache.set(role, set)
  return set
}

/** 清除权限缓存（seed 后调用） */
export function clearPermCache() {
  permCache.clear()
}

/**
 * 检查用户是否拥有指定权限
 */
export async function hasPermission(role: UserRole, code: PermissionCode | string): Promise<boolean> {
  const perms = await getRolePermissions(role)
  return perms.has(code)
}

/**
 * 要求拥有指定权限，否则 403
 */
export async function requirePermission(event: H3Event, code: PermissionCode | string) {
  const user = requireAuth(event)
  const ok = await hasPermission(user.role, code)
  if (!ok) {
    throw createError({ statusCode: 403, message: `缺少权限: ${code}` })
  }
  return user
}

/**
 * 初始化权限数据到数据库
 */
export async function seedPermissions() {
  const db = useDb()
  const { PERMISSION_CODES } = await import('../database/schema')

  for (const p of PERMISSION_CODES) {
    const [existing] = await db.select().from(permissions).where(eq(permissions.code, p.code)).limit(1)
    if (!existing) {
      await db.insert(permissions).values({ code: p.code, name: p.name, groupName: p.groupName })
    }
  }

  const allPerms = await db.select().from(permissions)
  const permMap = new Map(allPerms.map((p) => [p.code, p.id]))

  // admin 拥有全部权限
  for (const p of PERMISSION_CODES) {
    const permId = permMap.get(p.code)
    if (!permId) continue
    const [exists] = await db
      .select()
      .from(rolePermissions)
      .where(and(eq(rolePermissions.role, 'admin'), eq(rolePermissions.permissionId, permId)))
      .limit(1)
    if (!exists) {
      await db.insert(rolePermissions).values({ role: 'admin', permissionId: permId })
    }
  }

  // user 仅有基础权限
  const userPermCodes = ['post:list']
  for (const code of userPermCodes) {
    const permId = permMap.get(code)
    if (!permId) continue
    const [exists] = await db
      .select()
      .from(rolePermissions)
      .where(and(eq(rolePermissions.role, 'user'), eq(rolePermissions.permissionId, permId)))
      .limit(1)
    if (!exists) {
      await db.insert(rolePermissions).values({ role: 'user', permissionId: permId })
    }
  }

  clearPermCache()
}
