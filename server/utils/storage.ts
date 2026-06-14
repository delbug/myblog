import { mkdir, writeFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { createHash } from 'node:crypto'

export interface StorageResult {
  url: string
  path: string
  filename: string
}

/**
 * 存储抽象：本地存储（默认），OSS 通过环境变量切换
 */
export async function storeFile(
  buffer: Buffer,
  originalName: string,
  siteUrl: string,
): Promise<StorageResult> {
  const driver = process.env.STORAGE_DRIVER || 'local'

  if (driver === 'oss') {
    return storeToOss(buffer, originalName, siteUrl)
  }
  return storeLocal(buffer, originalName, siteUrl)
}

/** 本地存储 */
async function storeLocal(buffer: Buffer, originalName: string, siteUrl: string): Promise<StorageResult> {
  const ext = extname(originalName) || '.png'
  const hash = createHash('md5').update(buffer).digest('hex')
  const filename = `${hash}${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), buffer)
  return { url: `${siteUrl}/uploads/${filename}`, path: `/uploads/${filename}`, filename }
}

/**
 * OSS 存储（预留接口，需配置 OSS 环境变量后实现）
 * OSS_REGION / OSS_BUCKET / OSS_ACCESS_KEY / OSS_SECRET_KEY
 */
async function storeToOss(buffer: Buffer, originalName: string, siteUrl: string): Promise<StorageResult> {
  const { OSS_REGION, OSS_BUCKET, OSS_ACCESS_KEY, OSS_SECRET_KEY, OSS_CDN_URL } = process.env
  if (!OSS_REGION || !OSS_BUCKET || !OSS_ACCESS_KEY || !OSS_SECRET_KEY) {
    console.warn('[storage] OSS 未配置，回退到本地存储')
    return storeLocal(buffer, originalName, siteUrl)
  }

  // 预留 OSS SDK 接入点；当前回退本地
  // 接入示例：ali-oss / @aws-sdk/client-s3
  console.warn('[storage] OSS SDK 待接入，当前回退本地存储')
  return storeLocal(buffer, originalName, siteUrl)
}
