<template>
  <div>
    <AdminPageHeader title="文章管理" :breadcrumb="[{ label: '文章管理' }]">
      <template #extra>
        <a-button v-auth="'post:create'" type="primary" @click="navigateTo('/admin/posts/new')">新建文章</a-button>
      </template>
    </AdminPageHeader>

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
        <a-tag :color="value === 'published' ? 'success' : 'warning'">
          {{ value === 'published' ? '已发布' : '草稿' }}
        </a-tag>
      </template>
      <template #col-createdAt="{ value }">{{ formatDate(String(value)) }}</template>
      <template #actions="{ row }">
        <a-space>
          <a-button v-auth="'post:update'" type="link" size="small" @click="navigateTo(`/admin/posts/${row.id}`)">编辑</a-button>
          <a-button v-auth="'post:delete'" type="link" size="small" danger @click="remove(Number(row.id))">删除</a-button>
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
const keyword = ref('')

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 70 },
  { key: 'title', title: '标题' },
  { key: 'status', title: '状态', width: 100 },
  { key: 'viewCount', title: '阅读', width: 80 },
  { key: 'likeCount', title: '点赞', width: 80 },
  { key: 'createdAt', title: '创建时间', width: 120 },
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

function remove(id: number) {
  Modal.confirm({
    title: '移入回收站？',
    content: '文章将移入回收站，可稍后恢复。',
    okType: 'danger',
    onOk: async () => {
      await $fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      message.success('已移入回收站')
      refresh()
    },
  })
}
</script>
