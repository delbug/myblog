import { getPostBySlug, getRelatedPosts } from '../../utils/post'
import { apiSuccess } from '../../utils/auth'

/**
 * GET /api/posts/:slug
 * 获取单篇文章详情（含 Markdown 渲染 HTML）
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: '缺少文章 slug' })
  }

  const post = await getPostBySlug(slug)
  if (!post) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  const related = await getRelatedPosts(post.id, post.categoryId)

  return apiSuccess({ ...post, related })
})
