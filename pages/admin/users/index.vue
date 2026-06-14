<template>
  <div>
    <AdminPageHeader title="用户管理" :breadcrumb="[{ label: '用户管理' }]" />

    <a-table
      :columns="tableColumns"
      :data-source="list"
      row-key="id"
      size="middle"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'role'">
          <a-select
            :value="record.role"
            size="small"
            style="width: 110px"
            @change="(v: string) => updateUser(Number(record.id), { role: v })"
          >
            <a-select-option value="user">用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </template>
        <template v-else-if="column.key === 'status'">
          <a-select
            :value="record.status"
            size="small"
            style="width: 100px"
            @change="(v: string) => updateUser(Number(record.id), { status: v })"
          >
            <a-select-option value="active">正常</a-select-option>
            <a-select-option value="disabled">禁用</a-select-option>
          </a-select>
        </template>
        <template v-else-if="column.key === 'createdAt'">
          {{ formatDate(String(record.createdAt)) }}
        </template>
        <template v-else-if="column.key === 'email'">
          {{ record.email || '-' }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { formatDate } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const tableColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', key: 'email' },
  { title: '角色', key: 'role', width: 130 },
  { title: '状态', key: 'status', width: 120 },
  { title: '注册时间', key: 'createdAt', width: 120 },
]

const { data, refresh } = await useFetch('/api/admin/users')
const list = computed(() => data.value?.data?.list || [])

async function updateUser(id: number, body: Record<string, string>) {
  await $fetch(`/api/admin/users/${id}`, { method: 'PUT', body })
  message.success('已更新')
  refresh()
}
</script>
