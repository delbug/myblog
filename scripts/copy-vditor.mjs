import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const src = join(process.cwd(), 'node_modules/vditor/dist')
/** Vditor 请求路径为 ${cdn}/dist/js/...，cdn='/vditor' → /vditor/dist/... */
const root = join(process.cwd(), 'public/vditor')
const dest = join(root, 'dist')

if (!existsSync(src)) {
  console.warn('[copy-vditor] vditor not installed, skip')
  process.exit(0)
}

rmSync(root, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('[copy-vditor] copied to public/vditor/dist')
