<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">标签管理</h1>
      <button class="btn-primary" @click="showForm = !showForm">{{ showForm ? '取消' : '新建标签' }}</button>
    </div>

    <form v-if="showForm" class="card mb-6 flex gap-3" @submit.prevent="create">
      <input v-model="newTag.name" class="input flex-1" placeholder="标签名称" required />
      <button type="submit" class="btn-primary">创建</button>
    </form>

    <div class="card">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in list"
          :key="tag.id"
          class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700"
        >
          #{{ tag.name }}
          <button class="text-red-400 hover:text-red-600" @click="remove(tag.id)">×</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const showForm = ref(false)
const newTag = reactive({ name: '' })
const { data, refresh } = await useFetch('/api/tags')
const list = computed(() => data.value?.data || [])

async function create() {
  await $fetch('/api/tags', { method: 'POST', body: newTag })
  newTag.name = ''
  showForm.value = false
  refresh()
}

async function remove(id: number) {
  if (!confirm('确定删除该标签？')) return
  await $fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
