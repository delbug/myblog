<template>
  <div>
    <AdminPageHeader title="回收站" :breadcrumb="[{ label: '文章管理', to: '/admin/posts' }, { label: '回收站' }]">
      <template #extra>
        <a-button @click="navigateTo('/admin/posts')">返回文章列表</a-button>
      </template>
    </AdminPageHeader>

    <AdminDynamicTable
      :columns="columns"
      :data="posts"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :searchable="false"
      row-key="id"
      @page-change="onPageChange"
    >
      <template #col-deletedAt="{ value }">{{ formatDate(String(value)) }}</template>
      <template #col-status="{ value }"><a-tag>{{ value }}</a-tag></template>
      <template #actions="{ row }">
        <a-space>
          <a-button v-auth="'post:restore'" type="link" size="small" @click="restore(Number(row.id))">恢复</a-button>
          <a-button v-auth="'post:purge'" type="link" size="small" danger @click="purge(Number(row.id))">永久删除</a-button>
        </a-space>
      </template>
    </AdminDynamicTable>
  </div>
</template>

<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'
import { formatDate } from '~/utils/format'
import type { TableColumn } from '~/components/admin/AdminDynamicTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const page = ref(1)
const pageSize = 10

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 70 },
  { key: 'title', title: '标题' },
  { key: 'status', title: '状态', width: 100 },
  { key: 'deletedAt', title: '删除时间', width: 120 },
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
  message.success('已恢复')
  refresh()
}

function purge(id: number) {
  Modal.confirm({
    title: '永久删除？',
    content: '删除后无法恢复，且会从搜索索引中移除。',
    okType: 'danger',
    onOk: async () => {
      await $fetch(`/api/admin/posts/${id}/permanent`, { method: 'DELETE' })
      message.success('已永久删除')
      refresh()
    },
  })
}
</script>
