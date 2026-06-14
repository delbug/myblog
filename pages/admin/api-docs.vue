<template>
  <div>
    <AdminBreadcrumb :items="[{ label: 'API 文档' }]" />
    <h1 class="mb-4 text-2xl font-bold">API 文档</h1>
    <div class="card overflow-hidden">
      <iframe src="/openapi.json" class="hidden" />
      <div class="prose-blog max-w-none text-sm" v-html="docHtml" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

/** 渲染 OpenAPI 端点列表 */
const endpoints = [
  { method: 'GET', path: '/api/posts', desc: '文章列表' },
  { method: 'GET', path: '/api/posts/:slug', desc: '文章详情' },
  { method: 'POST', path: '/api/posts/:id/like', desc: '点赞/取消' },
  { method: 'POST', path: '/api/posts/:id/favorite', desc: '收藏/取消' },
  { method: 'GET', path: '/api/search?keyword=', desc: '全文搜索' },
  { method: 'GET/POST', path: '/api/comments', desc: '评论列表/提交' },
  { method: 'POST', path: '/api/auth/login', desc: '登录' },
  { method: 'POST', path: '/api/auth/register', desc: '注册' },
  { method: 'GET', path: '/api/auth/me', desc: '当前用户' },
  { method: 'GET', path: '/api/auth/permissions', desc: '权限码列表' },
  { method: 'POST', path: '/api/upload/image', desc: '图片上传' },
  { method: 'GET', path: '/api/admin/posts', desc: '管理-文章列表' },
  { method: 'POST', path: '/api/admin/posts', desc: '管理-创建文章' },
  { method: 'GET/PUT/DELETE', path: '/api/admin/posts/:id', desc: '管理-文章 CRUD' },
  { method: 'GET', path: '/api/admin/users', desc: '管理-用户列表' },
  { method: 'GET', path: '/api/admin/logs', desc: '管理-操作日志' },
  { method: 'GET', path: '/api/user/favorites', desc: '我的收藏' },
]

const docHtml = endpoints.map((e) =>
  `<div class="mb-3 rounded border p-3 dark:border-gray-700">
    <code class="text-primary-600">${e.method}</code>
    <code class="ml-2">${e.path}</code>
    <p class="mt-1 text-gray-500">${e.desc}</p>
  </div>`,
).join('')
</script>
