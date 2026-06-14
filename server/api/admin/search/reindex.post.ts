import { requirePermission, apiSuccess, writeLog } from '../../../utils'
import { rebuildPostIndex } from '../../../utils/postIndex'

/** POST /api/admin/search/reindex - 重建 Meilisearch 索引 */
export default defineEventHandler(async (event) => {
  const user = await requirePermission(event, 'setting:manage')
  const result = await rebuildPostIndex()

  await writeLog(event, {
    userId: user.userId,
    username: user.username,
    action: 'reindex',
    resource: 'search',
    detail: `重建搜索索引，共 ${result.indexed} 篇`,
  })

  return apiSuccess(result, '搜索索引重建完成')
})
