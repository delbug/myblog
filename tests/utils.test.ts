import { describe, it, expect } from 'vitest'
import { slugify } from '../server/utils/auth'

describe('slugify', () => {
  it(' converts Chinese title to slug', () => {
    const result = slugify('Hello World 测试')
    expect(result).toBeTruthy()
    expect(result).not.toContain(' ')
  })

  it('handles empty string', () => {
    const result = slugify('!!!')
    expect(result).toMatch(/^post-/)
  })
})

describe('apiSuccess format', () => {
  it('returns standard response shape', async () => {
    const { apiSuccess } = await import('../server/utils/auth')
    const res = apiSuccess({ id: 1 }, 'ok')
    expect(res).toEqual({ code: 0, message: 'ok', data: { id: 1 } })
  })
})
