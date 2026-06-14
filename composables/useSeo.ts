/**
 * 设置页面 SEO Meta 标签
 * 在 SSR 阶段写入 HTML，搜索引擎可直接抓取
 */
export function usePageSeo(options: {
  title?: string
  description?: string
  image?: string
  type?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
  keywords?: string[]
}) {
  const config = useRuntimeConfig()
  const siteName = config.public.siteName as string
  const siteUrl = config.public.siteUrl as string
  const defaultDesc = config.public.siteDescription as string

  const title = options.title ? `${options.title} | ${siteName}` : siteName
  const description = options.description || defaultDesc
  const image = options.image || `${siteUrl}/og-default.png`
  const url = useRequestURL().href

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    ogType: (options.type || 'website') as 'website' | 'article',
    ogSiteName: siteName,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    articleAuthor: options.author ? [options.author] : undefined,
    articlePublishedTime: options.publishedTime,
    articleModifiedTime: options.modifiedTime,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })

  // JSON-LD 结构化数据，帮助 Google 展示富媒体搜索结果
  if (options.type === 'article' && options.title) {
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: options.title,
          description,
          image,
          datePublished: options.publishedTime,
          dateModified: options.modifiedTime || options.publishedTime,
          author: { '@type': 'Person', name: options.author || siteName },
          publisher: { '@type': 'Organization', name: siteName },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        }),
      }],
    })
  }
}
