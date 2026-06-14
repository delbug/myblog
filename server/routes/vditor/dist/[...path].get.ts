import { createReadStream, existsSync } from 'node:fs'
import { extname, join } from 'node:path'
import { sendStream, setHeader } from 'h3'

const MIME: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

/**
 * 本地 Vditor 静态资源：/vditor/dist/*
 * dev 下 public 目录偶发 404，统一从 node_modules（或 public 副本）读取
 */
export default defineEventHandler((event) => {
  const rel = getRouterParam(event, 'path') || ''
  if (!rel || rel.includes('..')) {
    throw createError({ statusCode: 400, message: 'Invalid path' })
  }

  const candidates = [
    join(process.cwd(), 'node_modules/vditor/dist', rel),
    join(process.cwd(), 'public/vditor/dist', rel),
  ]

  const file = candidates.find(p => existsSync(p))
  if (!file) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  const type = MIME[extname(file)] || 'application/octet-stream'
  setHeader(event, 'Content-Type', type)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(file))
})
