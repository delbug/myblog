import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '../../database'
import { getAuthUser, apiSuccess, checkRateLimit, zodFirstError } from '../../utils'

const { comments } = schema

const commentSchema = z.object({
  postId: z.number(),
  parentId: z.number().nullable().optional(),
  authorName: z.string().min(1, '昵称不能为空').max(50).optional(),
  authorEmail: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  content: z.string().min(1, '评论内容不能为空').max(2000),
})

/** 将平铺评论构建为嵌套树 */
function buildCommentTree(list: typeof comments.$inferSelect[]) {
  const map = new Map<number, typeof list[0] & { replies: typeof list }>()
  const roots: Array<typeof list[0] & { replies: typeof list }> = []

  for (const c of list) map.set(c.id, { ...c, replies: [] as typeof list })
  for (const c of list) {
    const node = map.get(c.id)!
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

/**
 * GET /api/comments?postId=1 - 获取嵌套评论树
 * POST /api/comments - 提交评论（登录用户自动填充昵称）
 */
export default defineEventHandler(async (event) => {
  const db = useDb()

  if (event.method === 'GET') {
    const postId = Number(getQuery(event).postId)
    if (!postId) throw createError({ statusCode: 400, message: '缺少 postId' })

    const list = await db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.status, 'approved')))
      .orderBy(desc(comments.createdAt))

    return apiSuccess(buildCommentTree(list))
  }

  if (event.method === 'POST') {
    if (!checkRateLimit(event, { max: 5, windowMs: 60_000, key: `comment:${getRequestHeader(event, 'x-real-ip')}` })) {
      throw createError({ statusCode: 429, message: '评论过于频繁，请稍后再试' })
    }

    const auth = getAuthUser(event)
    const body = await readBody(event)
    const parsed = commentSchema.safeParse(body)
    if (!parsed.success) {
      throw createError({ statusCode: 400, message: zodFirstError(parsed.error) })
    }

    const data = parsed.data
    const [result] = await db.insert(comments).values({
      postId: data.postId,
      parentId: data.parentId || null,
      userId: auth?.userId || null,
      authorName: auth?.username || data.authorName || '匿名',
      authorEmail: data.authorEmail || null,
      content: data.content,
      status: 'pending',
    })

    const [created] = await db.select().from(comments).where(eq(comments.id, result.insertId)).limit(1)
    return apiSuccess(created, '评论已提交，等待审核')
  }
})
