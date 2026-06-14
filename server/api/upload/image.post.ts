import { readMultipartFormData } from 'h3'
import { requireAuth, apiSuccess, storeFile } from '../../utils'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024

/** POST /api/upload/image - 上传图片（支持本地/OSS 存储驱动） */
export default defineEventHandler(async (event) => {
  requireAuth(event)

  const form = await readMultipartFormData(event)
  const file = form?.find((item) => item.name === 'file')

  if (!file?.data) throw createError({ statusCode: 400, message: '请选择要上传的图片' })
  if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
    throw createError({ statusCode: 400, message: '仅支持 jpeg/png/gif/webp 格式' })
  }
  if (file.data.length > MAX_SIZE) throw createError({ statusCode: 400, message: '图片大小不能超过 10MB' })

  const config = useRuntimeConfig()
  const result = await storeFile(Buffer.from(file.data), file.filename || 'image.png', config.public.siteUrl as string)

  return apiSuccess(result, '上传成功')
})
