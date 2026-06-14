import { mkdir, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { createHash } from 'node:crypto'

export interface StorageResult {
  url: string
  path: string
  filename: string
}

type StorageDriver = 'local' | 'aliyun' | 'qiniu' | 'cloudinary' | 'oss'

function resolveDriver(): StorageDriver {
  const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase()
  if (driver === 'oss') return 'aliyun'
  if (driver === 'aliyun' || driver === 'qiniu' || driver === 'cloudinary') return driver
  return 'local'
}

/**
 * 存储抽象：local / aliyun(OSS) / qiniu
 */
export async function storeFile(
  buffer: Buffer,
  originalName: string,
  siteUrl: string,
): Promise<StorageResult> {
  const driver = resolveDriver()

  if (driver === 'aliyun') {
    return storeToAliyun(buffer, originalName)
  }
  if (driver === 'qiniu') {
    return storeToQiniu(buffer, originalName)
  }
  if (driver === 'cloudinary') {
    return storeToCloudinary(buffer, originalName)
  }
  return storeLocal(buffer, originalName, siteUrl)
}

function buildFilename(buffer: Buffer, originalName: string): string {
  const ext = extname(originalName) || '.png'
  const hash = createHash('md5').update(buffer).digest('hex')
  return `${hash}${ext}`
}

/** 本地存储 */
async function storeLocal(buffer: Buffer, originalName: string, siteUrl: string): Promise<StorageResult> {
  const filename = buildFilename(buffer, originalName)
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), buffer)
  return { url: `${siteUrl}/uploads/${filename}`, path: `/uploads/${filename}`, filename }
}

/** 阿里云 OSS */
async function storeToAliyun(buffer: Buffer, originalName: string): Promise<StorageResult> {
  const { OSS_REGION, OSS_BUCKET, OSS_ACCESS_KEY, OSS_SECRET_KEY, OSS_CDN_URL } = process.env
  if (!OSS_REGION || !OSS_BUCKET || !OSS_ACCESS_KEY || !OSS_SECRET_KEY) {
    console.warn('[storage] 阿里云 OSS 未配置，回退本地')
    return storeLocal(buffer, originalName, process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  }

  const OSS = (await import('ali-oss')).default
  const client = new OSS({
    region: OSS_REGION,
    accessKeyId: OSS_ACCESS_KEY,
    accessKeySecret: OSS_SECRET_KEY,
    bucket: OSS_BUCKET,
  })

  const filename = buildFilename(buffer, originalName)
  const objectKey = `uploads/${filename}`
  await client.put(objectKey, buffer)

  const url = OSS_CDN_URL
    ? `${OSS_CDN_URL.replace(/\/$/, '')}/${objectKey}`
    : `https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com/${objectKey}`

  return { url, path: `/${objectKey}`, filename }
}

/** 七牛云 */
async function storeToQiniu(buffer: Buffer, originalName: string): Promise<StorageResult> {
  const { QINIU_ACCESS_KEY, QINIU_SECRET_KEY, QINIU_BUCKET, QINIU_DOMAIN } = process.env
  if (!QINIU_ACCESS_KEY || !QINIU_SECRET_KEY || !QINIU_BUCKET || !QINIU_DOMAIN) {
    console.warn('[storage] 七牛云未配置，回退本地')
    return storeLocal(buffer, originalName, process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  }

  const qiniu = await import('qiniu')
  const mac = new qiniu.auth.digest.Mac(QINIU_ACCESS_KEY, QINIU_SECRET_KEY)
  const config = new qiniu.conf.Config()
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()

  const filename = buildFilename(buffer, originalName)
  const objectKey = `uploads/${filename}`
  const options = { scope: `${QINIU_BUCKET}:${objectKey}` }
  const uploadToken = new qiniu.rs.PutPolicy(options).uploadToken(mac)

  await new Promise<void>((resolve, reject) => {
    formUploader.put(uploadToken, objectKey, buffer, putExtra, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })

  const url = `${QINIU_DOMAIN.replace(/\/$/, '')}/${objectKey}`
  return { url, path: `/${objectKey}`, filename }
}

/** Cloudinary 图床 */
async function storeToCloudinary(buffer: Buffer, originalName: string): Promise<StorageResult> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER } = process.env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn('[storage] Cloudinary 未配置，回退本地')
    return storeLocal(buffer, originalName, process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  }

  const { v2: cloudinary } = await import('cloudinary')
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })

  const filename = buildFilename(buffer, originalName)
  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER || 'blog/uploads', public_id: filename.replace(/\.[^.]+$/, '') },
      (err, res) => (err || !res ? reject(err || new Error('Cloudinary upload failed')) : resolve(res)),
    )
    stream.end(buffer)
  })

  return { url: result.secure_url, path: result.public_id, filename }
}
