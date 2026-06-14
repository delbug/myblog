import { createReadStream, existsSync } from 'node:fs'
import { extname, join } from 'node:path'
import type { Plugin } from 'vite'

const MIME: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}

/** dev 下 Vite 会把 /vditor/dist/*.js 当成模块请求，需提前用中间件返回静态文件 */
export function vditorStaticPlugin(): Plugin {
  return {
    name: 'vditor-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        if (!url.startsWith('/vditor/dist/')) return next()

        const rel = decodeURIComponent(url.slice('/vditor/dist/'.length))
        if (!rel || rel.includes('..')) {
          res.statusCode = 400
          res.end('Bad request')
          return
        }

        const candidates = [
          join(process.cwd(), 'node_modules/vditor/dist', rel),
          join(process.cwd(), 'public/vditor/dist', rel),
        ]
        const file = candidates.find(p => existsSync(p))
        if (!file) {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        res.statusCode = 200
        res.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        createReadStream(file).pipe(res)
      })
    },
  }
}
