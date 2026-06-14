<template>
  <div>
    <AdminBreadcrumb :items="[{ label: '文章管理' }]" />

    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">文章管理</h1>
      <NuxtLink v-auth="'post:create'" to="/admin/posts/new" class="btn-primary">新建文章</NuxtLink>
    </div>

    <AdminDynamicTable
      :columns="columns"
      :data="posts"
      :total="total"
      :page="page"
      :page-size="pageSize"
      exportable
      export-filename="posts.csv"
      row-key="id"
      @search="onSearch"
      @page-change="onPageChange"
    >
      <template #col-status="{ value }">
        <span class="rounded px-2 py-0.5 text-xs" :class="value === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
          {{ value === 'published' ? '已发布' : '草稿' }}
        </span>
      </template>
      <template #col-createdAt="{ value }">{{ formatDate(String(value)) }}</template>
      <template #actions="{ row }">
        <NuxtLink v-auth="'post:update'" :to="`/admin/posts/${row.id}`" class="mr-2 text-primary-600 hover:underline">编辑</NuxtLink>
        <button v-auth="'post:delete'" class="text-red-500 hover:underline" @click="remove(Number(row.id))">删除</button>
      </template>
    </AdminDynamicTable>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'
import type { TableColumn } from '~/components/admin/AdminDynamicTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const page = ref(1)
const pageSize = 10
const keyword = ref('')

const columns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'title', title: '标题' },
  { key: 'status', title: '状态' },
  { key: 'viewCount', title: '阅读' },
  { key: 'likeCount', title: '点赞' },
  { key: 'createdAt', title: '创建时间' },
]

const { data, refresh } = await useFetch('/api/admin/posts', {
  query: computed(() => ({ page: page.value, pageSize, keyword: keyword.value || undefined })),
})

const posts = computed(() => (data.value?.data?.list || []) as Record<string, unknown>[])
const total = computed(() => data.value?.data?.total || 0)

function onSearch(kw: string) {
  keyword.value = kw
  page.value = 1
  refresh()
}

function onPageChange(p: number) {
  page.value = p
  refresh()
}

async function remove(id: number) {
  if (!confirm('确定移入回收站？')) return
  await $fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
