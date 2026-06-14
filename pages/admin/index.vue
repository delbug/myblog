<template>
  <div>
    <AdminPageHeader title="仪表盘">
      <template #extra>
        <a-button type="primary" @click="navigateTo('/admin/posts/new')">写新文章</a-button>
      </template>
    </AdminPageHeader>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="8">
        <a-card>
          <a-statistic title="已发布文章" :value="stats.published" value-style="color: #1677ff" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card>
          <a-statistic title="草稿" :value="stats.draft" value-style="color: #faad14" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card>
          <a-statistic title="待审核评论" :value="stats.pendingComments" value-style="color: #52c41a" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
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
