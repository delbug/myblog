import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

let pool: mysql.Pool | null = null

/**
 * 获取 MySQL 连接池（单例模式）
 * 在 Nitro 服务端复用连接，避免频繁建连
 */
/** 读取数据库配置（兼容 Nitro 运行时与独立脚本） */
function getDbConfig() {
  try {
    const config = useRuntimeConfig()
    return {
      host: config.dbHost as string,
      port: Number(config.dbPort),
      user: config.dbUser as string,
      password: config.dbPassword as string,
      database: config.dbName as string,
    }
  } catch {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'blog',
      password: process.env.DB_PASSWORD || 'blog123',
      database: process.env.DB_NAME || 'blog_db',
    }
  }
}

function getPool() {
  if (!pool) {
    const cfg = getDbConfig()
    pool = mysql.createPool({
      ...cfg,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

/**
 * 获取 Drizzle ORM 实例
 * 所有数据库操作应通过此函数获取 db
 */
export function useDb() {
  return drizzle(getPool(), { schema, mode: 'default' })
}

export { schema }
