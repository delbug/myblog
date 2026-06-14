import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

let md: MarkdownIt | null = null

/**
 * 客户端 Markdown 渲染（用于编辑器实时预览）
 */
export function useMarkdownPreview() {
  function render(content: string): string {
    if (!import.meta.client) return ''
    if (!md) {
      md = new MarkdownIt({
        html: false,
        linkify: true,
        typographer: true,
        highlight(str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
            } catch { /* fallthrough */ }
          }
          return `<pre class="hljs"><code>${md!.utils.escapeHtml(str)}</code></pre>`
        },
      })
    }
    return md.render(content)
  }

  return { render }
}
