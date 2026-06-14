/**
 * 全局请求日志中间件
 * 记录 API 请求的方法、路径、耗时
 */
export default defineEventHandler((event) => {
  const start = Date.now()
  const path = event.path

  if (!path.startsWith('/api')) return

  event.node.res.on('finish', () => {
    const ms = Date.now() - start
    const status = event.node.res.statusCode
    console.log(`[API] ${event.method} ${path} ${status} ${ms}ms`)
  })
})
