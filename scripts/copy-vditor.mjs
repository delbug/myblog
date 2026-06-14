import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const src = join(process.cwd(), 'node_modules/vditor/dist')
const dest = join(process.cwd(), 'public/vditor')

if (!existsSync(src)) {
  console.warn('[copy-vditor] vditor not installed, skip')
  process.exit(0)
}

mkdirSync(join(process.cwd(), 'public'), { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('[copy-vditor] copied to public/vditor')
