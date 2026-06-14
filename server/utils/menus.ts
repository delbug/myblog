import { eq, asc } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { useDb, schema } from '../database'
import { getAuthUser } from './auth'
import { hasPermission } from './permission'

const { adminMenus } = schema

export interface AdminMenuItem {
  id: number
  label: string
  path: string
  icon: string | null
  permissionCode: string | null
  sortOrder: number
  enabled: number
  parentId: number | null
}

/** 默认菜单（seed 写入） */
export const DEFAULT_ADMIN_MENUS: Omit<AdminMenuItem, 'id'>[] = [
  { label: '仪表盘', path: '/admin', icon: '📊', permissionCode: null, sortOrder: 0, enabled: 1, parentId: null },
  { label: '文章管理', path: '/admin/posts', icon: '📝', permissionCode: 'post:list', sortOrder: 10, enabled: 1, parentId: null },
  { label: '写文章', path: '/admin/posts/new', icon: '✏️', permissionCode: 'post:create', sortOrder: 11, enabled: 1, parentId: null },
  { label: '回收站', path: '/admin/posts/trash', icon: '🗑️', permissionCode: 'post:restore', sortOrder: 12, enabled: 1, parentId: null },
  { label: '分类管理', path: '/admin/categories', icon: '📁', permissionCode: 'category:manage', sortOrder: 20, enabled: 1, parentId: null },
  { label: '标签管理', path: '/admin/tags', icon: '🏷️', permissionCode: 'tag:manage', sortOrder: 30, enabled: 1, parentId: null },
  { label: '评论管理', path: '/admin/comments', icon: '💬', permissionCode: 'comment:manage', sortOrder: 40, enabled: 1, parentId: null },
  { label: '用户管理', path: '/admin/users', icon: '👥', permissionCode: 'user:manage', sortOrder: 50, enabled: 1, parentId: null },
  { label: '角色权限', path: '/admin/roles', icon: '🔐', permissionCode: 'role:manage', sortOrder: 51, enabled: 1, parentId: null },
  { label: '菜单管理', path: '/admin/menus', icon: '📋', permissionCode: 'menu:manage', sortOrder: 52, enabled: 1, parentId: null },
  { label: '操作日志', path: '/admin/logs', icon: '📜', permissionCode: 'log:view', sortOrder: 60, enabled: 1, parentId: null },
  { label: '站点设置', path: '/admin/settings', icon: '⚙️', permissionCode: 'setting:manage', sortOrder: 70, enabled: 1, parentId: null },
  { label: 'API 文档', path: '/admin/api-docs', icon: '📖', permissionCode: null, sortOrder: 80, enabled: 1, parentId: null },
]

/** 初始化默认菜单 */
export async function seedAdminMenus() {
  const db = useDb()
  const existing = await db.select().from(adminMenus).limit(1)
  if (existing.length) return

  for (const menu of DEFAULT_ADMIN_MENUS) {
    await db.insert(adminMenus).values(menu)
  }
}

/** 获取当前用户可见菜单 */
export async function getMenusForUser(event: H3Event) {
  const user = getAuthUser(event)
  if (!user || user.role !== 'admin') return []

  const db = useDb()
  const rows = await db
    .select()
    .from(adminMenus)
    .where(eq(adminMenus.enabled, 1))
    .orderBy(asc(adminMenus.sortOrder))

  const visible: AdminMenuItem[] = []
  for (const row of rows) {
    if (!row.permissionCode || await hasPermission(user.role, row.permissionCode)) {
      visible.push(row)
    }
  }
  return visible
}
