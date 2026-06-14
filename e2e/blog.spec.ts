import { test, expect } from '@playwright/test'

test.describe('前台', () => {
  test('首页可访问', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '最新文章' })).toBeVisible()
  })

  test('搜索页可访问', async ({ page }) => {
    await page.goto('/search?keyword=博客')
    await expect(page.getByRole('heading', { name: '搜索' })).toBeVisible()
  })
})

test.describe('后台', () => {
  test('管理员可登录后台', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'networkidle' })
    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('admin123')
    await page.getByRole('button', { name: '登 录' }).click()
    await page.waitForURL(/\/admin(\/)?$/, { timeout: 15_000 })
    await expect(page.locator('body')).toContainText('Blog Admin')
  })
})
