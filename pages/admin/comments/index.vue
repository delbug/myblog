<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">评论管理</h1>

    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="p-3">文章</th>
            <th class="p-3">昵称</th>
            <th class="p-3">内容</th>
            <th class="p-3">状态</th>
            <th class="p-3">时间</th>
            <th class="p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in comments" :key="comment.id" class="border-b border-gray-100 dark:border-gray-800">
            <td class="p-3 max-w-[120px] truncate">{{ comment.postTitle }}</td>
            <td class="p-3">{{ comment.authorName }}</td>
            <td class="p-3 max-w-[200px] truncate">{{ comment.content }}</td>
            <td class="p-3">
              <span
                class="rounded px-2 py-0.5 text-xs"
                :class="{
                  'bg-yellow-100 text-yellow-700': comment.status === 'pending',
                  'bg-green-100 text-green-700': comment.status === 'approved',
                  'bg-red-100 text-red-700': comment.status === 'rejected',
                }"
              >
                {{ statusLabel(comment.status) }}
              </span>
            </td>
            <td class="p-3">{{ formatDate(comment.createdAt) }}</td>
            <td class="p-3 space-x-2">
              <button v-if="comment.status !== 'approved'" class="text-green-600 hover:underline" @click="updateStatus(comment.id, 'approved')">通过</button>
              <button v-if="comment.status !== 'rejected'" class="text-yellow-600 hover:underline" @click="updateStatus(comment.id, 'rejected')">拒绝</button>
              <button class="text-red-500 hover:underline" @click="remove(comment.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

/** 评论审核管理页 */
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { data, refresh } = await useFetch('/api/admin/comments')
const comments = computed(() => data.value?.data || [])

/** 状态中文标签 */
function statusLabel(status: string) {
  return { pending: '待审核', approved: '已通过', rejected: '已拒绝' }[status] || status
}

/** 更新评论审核状态 */
async function updateStatus(id: number, status: string) {
  await $fetch(`/api/admin/comments/${id}`, { method: 'PUT', body: { status } })
  refresh()
}

/** 删除评论 */
async function remove(id: number) {
  if (!confirm('确定删除这条评论？')) return
  await $fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
