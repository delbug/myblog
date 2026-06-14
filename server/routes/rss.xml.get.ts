import { getPublishedPosts } from '../utils/post'

/**
 * GET /rss.xml
 * 生成 RSS 2.0 订阅源
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl
  const siteName = config.public.siteName
  const siteDescription = config.public.siteDescription

  const { list } = await getPublishedPosts({ page: 1, pageSize: 20 })

  const items = list.map((post) => {
    const pubDate = post.publishedAt
      ? new Date(post.publishedAt).toUTCString()
      : new Date(post.createdAt).toUTCString()

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid>${siteUrl}/posts/${post.slug}</guid>
      <description><![CDATA[${post.summary || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return rss
})
