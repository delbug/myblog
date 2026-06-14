<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">用户管理</h1>

    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b dark:border-gray-700">
            <th class="p-3">ID</th>
            <th class="p-3">用户名</th>
            <th class="p-3">邮箱</th>
            <th class="p-3">角色</th>
            <th class="p-3">状态</th>
            <th class="p-3">注册时间</th>
            <th class="p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in list" :key="u.id" class="border-b dark:border-gray-800">
            <td class="p-3">{{ u.id }}</td>
            <td class="p-3">{{ u.username }}</td>
            <td class="p-3">{{ u.email || '-' }}</td>
            <td class="p-3">
              <select
                :value="u.role"
                class="input py-1 text-xs"
                @change="updateUser(u.id, { role: ($event.target as HTMLSelectElement).value })"
              >
                <option value="user">用户</option>
                <option value="admin">管理员</option>
              </select>
            </td>
            <td class="p-3">
              <select
                :value="u.status"
                class="input py-1 text-xs"
                @change="updateUser(u.id, { status: ($event.target as HTMLSelectElement).value })"
              >
                <option value="active">正常</option>
                <option value="disabled">禁用</option>
              </select>
            </td>
            <td class="p-3">{{ formatDate(u.createdAt) }}</td>
            <td class="p-3 text-gray-400">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { data, refresh } = await useFetch('/api/admin/users')
const list = computed(() => data.value?.data?.list || [])

async function updateUser(id: number, body: Record<string, string>) {
  await $fetch(`/api/admin/users/${id}`, { method: 'PUT', body })
  refresh()
}
</script>
