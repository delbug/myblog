<template>
  <div>
    <AdminPageHeader title="评论管理" :breadcrumb="[{ label: '评论管理' }]" />

    <a-table
      :columns="tableColumns"
      :data-source="comments"
      :row-key="(r: Record<string, unknown>) => r.id"
      size="middle"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="statusColor(String(record.status))">{{ statusLabel(String(record.status)) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(String(record.createdAt)) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button v-if="record.status !== 'approved'" type="link" size="small" @click="updateStatus(Number(record.id), 'approved')">通过</a-button>
            <a-button v-if="record.status !== 'rejected'" type="link" size="small" @click="updateStatus(Number(record.id), 'rejected')">拒绝</a-button>
            <a-button type="link" size="small" danger @click="remove(Number(record.id))">删除</a-button>
          </a-space>
        </template>
      </template>
      <template #emptyText><a-empty description="暂无评论" /></template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'
import { formatDate } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const tableColumns = [
  { title: '文章', dataIndex: 'postTitle', key: 'postTitle', ellipsis: true, width: 140 },
  { title: '昵称', dataIndex: 'authorName', key: 'authorName', width: 100 },
  { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '状态', key: 'status', width: 100 },
  { title: '时间', key: 'createdAt', width: 120 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' as const },
]

const { data, refresh } = await useFetch('/api/admin/comments')
const comments = computed(() => data.value?.data || [])

function statusLabel(status: string) {
  return ({ pending: '待审核', approved: '已通过', rejected: '已拒绝' })[status] || status
}

function statusColor(status: string) {
  return ({ pending: 'warning', approved: 'success', rejected: 'error' })[status] || 'default'
}

async function updateStatus(id: number, status: string) {
  await $fetch(`/api/admin/comments/${id}`, { method: 'PUT', body: { status } })
  message.success('状态已更新')
  refresh()
}

function remove(id: number) {
  Modal.confirm({
    title: '删除评论？',
    okType: 'danger',
    onOk: async () => {
      await $fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
      message.success('已删除')
      refresh()
    },
  })
}
</script>
