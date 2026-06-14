import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItAttrs from 'markdown-it-attrs'
import hljs from 'highlight.js'

/**
 * 创建 Markdown 渲染器实例
 * 支持代码高亮、标题锚点、属性扩展
 */
export function createMarkdownRenderer() {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight(str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        } catch { /* fallthrough */ }
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    },
  })

  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.linkInsideHeader({ symbol: '#' }),
    level: [1, 2, 3, 4],
  })

  md.use(markdownItAttrs)

  return md
}

/** 单例 Markdown 渲染器 */
let renderer: ReturnType<typeof createMarkdownRenderer> | null = null

/**
 * 将 Markdown 文本渲染为 HTML
 */
export function renderMarkdown(content: string): string {
  if (!renderer) renderer = createMarkdownRenderer()
  return renderer.render(content)
}

/**
 * 从 Markdown 提取纯文本摘要
 */
export function extractSummary(content: string, maxLength = 200): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`>\-\[\]()!]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain
}
