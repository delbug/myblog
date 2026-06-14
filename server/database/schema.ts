import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  mysqlEnum,
  primaryKey,
  index,
} from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'

export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'disabled'

/** 用户表 */
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  email: varchar('email', { length: 100 }),
  avatar: varchar('avatar', { length: 500 }),
  bio: text('bio'),
  role: mysqlEnum('role', ['admin', 'user']).default('user').notNull(),
  status: mysqlEnum('status', ['active', 'disabled']).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

/** 权限表 */
export const permissions = mysqlTable('permissions', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  groupName: varchar('group_name', { length: 50 }),
})

/** 角色-权限关联 */
export const rolePermissions = mysqlTable(
  'role_permissions',
  {
    role: mysqlEnum('role', ['admin', 'user']).notNull(),
    permissionId: int('permission_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.role, table.permissionId] })],
)

/** 文章分类表 */
export const categories = mysqlTable('categories', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 200 }),
  parentId: int('parent_id'),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** 标签表 */
export const tags = mysqlTable('tags', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 30 }).notNull(),
  slug: varchar('slug', { length: 30 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

/** 文章表（含软删除） */
export const posts = mysqlTable(
  'posts',
  {
    id: int('id').primaryKey().autoincrement(),
    title: varchar('title', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    summary: varchar('summary', { length: 500 }),
    content: text('content').notNull(),
    contentHtml: text('content_html'),
    coverImage: varchar('cover_image', { length: 500 }),
    seoKeyword: varchar('seo_keyword', { length: 200 }),
    status: mysqlEnum('status', ['draft', 'published']).default('draft').notNull(),
    viewCount: int('view_count').default(0).notNull(),
    likeCount: int('like_count').default(0).notNull(),
    favoriteCount: int('favorite_count').default(0).notNull(),
    isTop: int('is_top').default(0).notNull(),
    sortOrder: int('sort_order').default(0).notNull(),
    authorId: int('author_id').notNull(),
    categoryId: int('category_id'),
    publishedAt: timestamp('published_at'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('idx_posts_status').on(table.status),
    index('idx_posts_published_at').on(table.publishedAt),
    index('idx_posts_category').on(table.categoryId),
    index('idx_posts_deleted').on(table.deletedAt),
  ],
)

export const postTags = mysqlTable(
  'post_tags',
  {
    postId: int('post_id').notNull(),
    tagId: int('tag_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
)

/** 文章点赞 */
export const postLikes = mysqlTable(
  'post_likes',
  {
    postId: int('post_id').notNull(),
    userId: int('user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
)

/** 文章收藏 */
export const postFavorites = mysqlTable(
  'post_favorites',
  {
    postId: int('post_id').notNull(),
    userId: int('user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
)

/** 评论表 */
export const comments = mysqlTable(
  'comments',
  {
    id: int('id').primaryKey().autoincrement(),
    postId: int('post_id').notNull(),
    parentId: int('parent_id'),
    userId: int('user_id'),
    authorName: varchar('author_name', { length: 50 }).notNull(),
    authorEmail: varchar('author_email', { length: 100 }),
    content: text('content').notNull(),
    status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_comments_post').on(table.postId)],
)

export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 50 }).primaryKey(),
  value: text('value'),
})

/** 后台动态菜单 */
export const adminMenus = mysqlTable('admin_menus', {
  id: int('id').primaryKey().autoincrement(),
  label: varchar('label', { length: 50 }).notNull(),
  path: varchar('path', { length: 200 }).notNull(),
  icon: varchar('icon', { length: 20 }),
  permissionCode: varchar('permission_code', { length: 100 }),
  sortOrder: int('sort_order').default(0).notNull(),
  enabled: int('enabled').default(1).notNull(),
  parentId: int('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const operationLogs = mysqlTable(
  'operation_logs',
  {
    id: int('id').primaryKey().autoincrement(),
    userId: int('user_id'),
    username: varchar('username', { length: 50 }),
    action: varchar('action', { length: 50 }).notNull(),
    resource: varchar('resource', { length: 50 }),
    resourceId: int('resource_id'),
    detail: text('detail'),
    ip: varchar('ip', { length: 45 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_logs_created').on(table.createdAt)],
)

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}))

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}))

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}))

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  posts: many(posts),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  category: one(categories, { fields: [posts.categoryId], references: [categories.id] }),
  postTags: many(postTags),
  comments: many(comments),
  likes: many(postLikes),
  favorites: many(postFavorites),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}))

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments),
}))

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
  user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}))

export const postFavoritesRelations = relations(postFavorites, ({ one }) => ({
  post: one(posts, { fields: [postFavorites.postId], references: [posts.id] }),
  user: one(users, { fields: [postFavorites.userId], references: [users.id] }),
}))

/** 所有权限码定义 */
export const PERMISSION_CODES = [
  { code: 'post:list', name: '查看文章', groupName: '文章' },
  { code: 'post:create', name: '创建文章', groupName: '文章' },
  { code: 'post:update', name: '编辑文章', groupName: '文章' },
  { code: 'post:delete', name: '删除文章', groupName: '文章' },
  { code: 'post:restore', name: '恢复文章', groupName: '文章' },
  { code: 'post:purge', name: '永久删除', groupName: '文章' },
  { code: 'category:manage', name: '分类管理', groupName: '分类' },
  { code: 'tag:manage', name: '标签管理', groupName: '标签' },
  { code: 'comment:manage', name: '评论管理', groupName: '评论' },
  { code: 'user:manage', name: '用户管理', groupName: '用户' },
  { code: 'role:manage', name: '角色权限', groupName: '用户' },
  { code: 'menu:manage', name: '菜单管理', groupName: '系统' },
  { code: 'setting:manage', name: '站点设置', groupName: '系统' },
  { code: 'log:view', name: '查看日志', groupName: '系统' },
] as const

export type PermissionCode = typeof PERMISSION_CODES[number]['code']
