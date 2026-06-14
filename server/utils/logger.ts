import { useDb, schema } from '../database'
import { getClientIp } from './auth'

const { operationLogs } = schema

/**
 * 记录操作日志到数据库
 */
export async function writeLog(
  event: Parameters<typeof getClientIp>[0],
  data: {
    userId?: number
    username?: string
    action: string
    resource?: string
    resourceId?: number
    detail?: string
  },
) {
  try {
    const db = useDb()
    await db.insert(operationLogs).values({
      userId: data.userId,
      username: data.username,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      detail: data.detail,
      ip: getClientIp(event),
    })
  } catch (e) {
    console.error('[writeLog]', e)
  }
}
