import { MeiliSearch } from 'meilisearch'

const INDEX = 'posts'

export interface MeiliPostDoc {
  id: number
  title: string
  slug: string
  summary: string | null
  content: string
  seoKeyword: string | null
  categoryName: string | null
  tagNames: string[]
  publishedAt: number | null
}

export interface MeiliSearchHit extends MeiliPostDoc {
  _formatted?: Partial<MeiliPostDoc>
}

/** 是否配置了 Meilisearch */
export function isMeiliEnabled(): boolean {
  return !!process.env.MEILISEARCH_HOST
}

function getClient(): MeiliSearch | null {
  const host = process.env.MEILISEARCH_HOST
  if (!host) return null
  return new MeiliSearch({
    host,
    apiKey: process.env.MEILISEARCH_API_KEY || undefined,
  })
}

/** 确保索引存在并配置 searchable / filterable 字段 */
export async function ensurePostIndex() {
  const client = getClient()
  if (!client) return

  try {
    await client.createIndex(INDEX, { primaryKey: 'id' })
  } catch {
    /* 索引已存在 */
  }

  const index = client.index(INDEX)
  await index.updateSearchableAttributes(['title', 'summary', 'content', 'seoKeyword', 'categoryName', 'tagNames'])
  await index.updateDisplayedAttributes(['id', 'title', 'slug', 'summary', 'publishedAt'])
}

/** 写入或更新单篇文章索引 */
export async function indexPost(doc: MeiliPostDoc) {
  const client = getClient()
  if (!client) return
  await ensurePostIndex()
  await client.index(INDEX).addDocuments([doc])
}

/** 从索引移除文章 */
export async function removePostFromIndex(id: number) {
  const client = getClient()
  if (!client) return
  try {
    await client.index(INDEX).deleteDocument(id)
  } catch {
    /* 文档可能不存在 */
  }
}

/** Meilisearch 全文搜索 */
export async function searchPostsMeili(keyword: string, page = 1, pageSize = 10) {
  const client = getClient()
  if (!client) return null

  await ensurePostIndex()
  const offset = (page - 1) * pageSize
  const result = await client.index(INDEX).search(keyword, {
    offset,
    limit: pageSize,
    attributesToHighlight: ['title', 'summary'],
  })

  return {
    list: result.hits as MeiliSearchHit[],
    total: result.estimatedTotalHits ?? result.hits.length,
    page,
    pageSize,
    engine: 'meilisearch' as const,
  }
}

/** 全量重建索引（供 seed / 管理端调用） */
export async function reindexAllPosts(docs: MeiliPostDoc[]) {
  const client = getClient()
  if (!client) return { indexed: 0 }

  await ensurePostIndex()
  await client.index(INDEX).deleteAllDocuments()
  if (docs.length) {
    await client.index(INDEX).addDocuments(docs)
  }
  return { indexed: docs.length }
}
