import { test, expect } from '@playwright/test'

test.describe('前台', () => {
  test('首页可访问', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('最新文章')
  })

  test('搜索页可访问', async ({ page }) => {
    await page.goto('/search?keyword=博客')
    await expect(page.locator('h1')).toContainText('搜索')
  })
})

test.describe('后台', () => {
  test('管理员可登录后台', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="text"], input[placeholder*="用户"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin(\/)?$/, { timeout: 15_000 })
    await expect(page.locator('body')).toContainText('Blog Admin')
  })
})
