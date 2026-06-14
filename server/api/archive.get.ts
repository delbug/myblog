import { getArchive } from '../utils/post'
import { apiSuccess } from '../utils/auth'

/**
 * GET /api/archive
 * 获取按年月分组的文章归档
 */
export default defineEventHandler(async () => {
  const archive = await getArchive()
  return apiSuccess(archive)
})
