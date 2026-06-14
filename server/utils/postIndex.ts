import { eq, and, isNull } from 'drizzle-orm'
import { useDb, schema } from '../database'
import { indexPost, removePostFromIndex, reindexAllPosts, type MeiliPostDoc } from './meilisearch'

const { posts, categories, tags, postTags } = schema

/** 构建 Meilisearch 文档 */
export async function buildMeiliDoc(postId: number): Promise<MeiliPostDoc | null> {
  const db = useDb()
  const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (!post || post.status !== 'published' || post.deletedAt) return null

  let categoryName: string | null = null
  if (post.categoryId) {
    const [cat] = await db.select().from(categories).where(eq(categories.id, post.categoryId)).limit(1)
    categoryName = cat?.name ?? null
  }

  const tagRows = await db
    .select({ name: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId))

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    content: post.content,
    seoKeyword: post.seoKeyword,
    categoryName,
    tagNames: tagRows.map((t) => t.name),
    publishedAt: post.publishedAt ? post.publishedAt.getTime() : null,
  }
}

/** 同步单篇文章到 Meilisearch（发布则索引，否则删除） */
export async function syncPostToIndex(postId: number) {
  const doc = await buildMeiliDoc(postId)
  if (doc) {
    await indexPost(doc)
  } else {
    await removePostFromIndex(postId)
  }
}

/** 全量重建 Meilisearch 索引 */
export async function rebuildPostIndex() {
  const db = useDb()
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.status, 'published'), isNull(posts.deletedAt)))

  const docs: MeiliPostDoc[] = []
  for (const row of rows) {
    const doc = await buildMeiliDoc(row.id)
    if (doc) docs.push(doc)
  }

  return reindexAllPosts(docs)
}
