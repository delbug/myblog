import { apiSuccess, parsePagination, searchPostsMeili, isMeiliEnabled } from '../utils'
import { getPublishedPosts } from '../utils/post'

/**
 * GET /api/search
 * Meilisearch 全文搜索（未配置时回退 MySQL LIKE）
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const keyword = (query.keyword as string)?.trim()
  if (!keyword) return apiSuccess({ list: [], total: 0, page: 1, pageSize: 10, engine: 'none' })

  const { page, pageSize } = parsePagination(query as Record<string, unknown>)

  if (isMeiliEnabled()) {
    const meiliResult = await searchPostsMeili(keyword, page, pageSize)
    if (meiliResult) return apiSuccess(meiliResult)
  }

  const result = await getPublishedPosts({ page, pageSize, keyword, orderBy: 'latest' })
  return apiSuccess({ ...result, engine: 'mysql' })
})
