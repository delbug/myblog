import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * 将 Markdown 文章备份到本地 storage/articles 目录
 */
export async function backupMarkdown(slug: string, title: string, content: string) {
  const dir = join(process.cwd(), 'storage', 'articles')
  await mkdir(dir, { recursive: true })

  const frontmatter = `---
title: ${title}
slug: ${slug}
backupAt: ${new Date().toISOString()}
---

`
  await writeFile(join(dir, `${slug}.md`), frontmatter + content, 'utf-8')
}
