import { getAllPublishedSlugs } from '../../utils/post'

/**
 * Sitemap 动态 URL 源
 * 供 @nuxtjs/sitemap 模块调用
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const slugs = await getAllPublishedSlugs()

  return slugs.map((item) => ({
    loc: `/posts/${item.slug}`,
    lastmod: item.updatedAt?.toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.8,
  }))
})
