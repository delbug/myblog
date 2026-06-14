/**
 * 格式化日期为中文友好格式
 */
export function formatDate(date: string | Date | null, format = 'YYYY-MM-DD'): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`
  if (format === 'YYYY年MM月DD日') return `${year}年${month}月${day}日`
  if (format === 'YYYY-MM') return `${year}-${month}`
  return `${year}-${month}-${day}`
}

/**
 * 截断文本
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}
