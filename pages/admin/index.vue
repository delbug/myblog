<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">仪表盘</h1>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-600">{{ stats.published }}</p>
        <p class="mt-1 text-sm text-gray-500">已发布文章</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-yellow-600">{{ stats.draft }}</p>
        <p class="mt-1 text-sm text-gray-500">草稿</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-green-600">{{ stats.pendingComments }}</p>
        <p class="mt-1 text-sm text-gray-500">待审核评论</p>
      </div>
    </div>

    <div class="mt-8">
      <NuxtLink to="/admin/posts/new" class="btn-primary">写新文章</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 管理后台仪表盘
 */
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { data: publishedData } = await useFetch('/api/admin/posts', { query: { status: 'published', pageSize: 1 } })
const { data: draftData } = await useFetch('/api/admin/posts', { query: { status: 'draft', pageSize: 1 } })
const { data: commentsData } = await useFetch('/api/admin/comments')

const stats = computed(() => ({
  published: publishedData.value?.data?.total || 0,
  draft: draftData.value?.data?.total || 0,
  pendingComments: (commentsData.value?.data || []).filter((c: { status: string }) => c.status === 'pending').length,
}))
</script>
