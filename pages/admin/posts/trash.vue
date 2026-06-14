<template>
  <div>
    <AdminBreadcrumb :items="[{ label: '文章管理', to: '/admin/posts' }, { label: '回收站' }]" />

    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">回收站</h1>
      <NuxtLink to="/admin/posts" class="btn-secondary">返回文章列表</NuxtLink>
    </div>

    <AdminDynamicTable
      :columns="columns"
      :data="posts"
      :total="total"
      :page="page"
      :page-size="pageSize"
      row-key="id"
      @page-change="onPageChange"
    >
      <template #col-deletedAt="{ value }">{{ formatDate(String(value)) }}</template>
      <template #col-status="{ value }">
        <span class="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{{ value }}</span>
      </template>
      <template #actions="{ row }">
        <button v-auth="'post:restore'" class="mr-2 text-primary-600 hover:underline" @click="restore(Number(row.id))">恢复</button>
        <button v-auth="'post:purge'" class="text-red-500 hover:underline" @click="purge(Number(row.id))">永久删除</button>
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

const columns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'title', title: '标题' },
  { key: 'status', title: '状态' },
  { key: 'deletedAt', title: '删除时间' },
]

const { data, refresh } = await useFetch('/api/admin/posts/trash', {
  query: computed(() => ({ page: page.value, pageSize })),
})

const posts = computed(() => (data.value?.data?.list || []) as Record<string, unknown>[])
const total = computed(() => data.value?.data?.total || 0)

function onPageChange(p: number) {
  page.value = p
  refresh()
}

async function restore(id: number) {
  await $fetch(`/api/admin/posts/${id}/restore`, { method: 'POST' })
  refresh()
}

async function purge(id: number) {
  if (!confirm('永久删除后无法恢复，确定继续？')) return
  await $fetch(`/api/admin/posts/${id}/permanent`, { method: 'DELETE' })
  refresh()
}
</script>
