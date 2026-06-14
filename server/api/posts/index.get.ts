import { getPublishedPosts } from '../../utils/post'
import { parsePagination, apiSuccess } from '../../utils/auth'

/**
 * GET /api/posts
 * 获取已发布文章列表，支持分页、分类、标签、搜索
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, pageSize } = parsePagination(query as Record<string, unknown>)

  const result = await getPublishedPosts({
    page,
    pageSize,
    categorySlug: query.category as string | undefined,
    tagSlug: query.tag as string | undefined,
    keyword: query.keyword as string | undefined,
    orderBy: (query.orderBy as 'latest' | 'popular') || 'latest',
  })

  return apiSuccess(result)
})
