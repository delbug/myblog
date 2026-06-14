import { apiSuccess, parsePagination } from '../utils'
import { getPublishedPosts } from '../utils/post'

/**
 * GET /api/search
 * 全文搜索（标题 + 摘要 + 正文 + SEO 关键词）
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const keyword = (query.keyword as string)?.trim()
  if (!keyword) return apiSuccess({ list: [], total: 0, page: 1, pageSize: 10 })

  const { page, pageSize } = parsePagination(query as Record<string, unknown>)
  const result = await getPublishedPosts({ page, pageSize, keyword, orderBy: 'latest' })
  return apiSuccess(result)
})
