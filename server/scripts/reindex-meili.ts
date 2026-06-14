import { rebuildPostIndex } from '../utils/postIndex'

async function main() {
  if (!process.env.MEILISEARCH_HOST) {
    console.error('❌ 请配置 MEILISEARCH_HOST')
    process.exit(1)
  }

  const result = await rebuildPostIndex()
  console.log(`✅ 索引重建完成，共 ${result.indexed} 篇文章`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
