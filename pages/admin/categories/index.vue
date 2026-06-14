<template>
  <div>
    <AdminBreadcrumb :items="[{ label: '分类管理' }]" />

    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">分类管理</h1>
      <button class="btn-primary" @click="showForm = !showForm">{{ showForm ? '取消' : '新建分类' }}</button>
    </div>

    <form v-if="showForm" class="card mb-6 grid gap-3 sm:grid-cols-2">
      <input v-model="newCat.name" class="input" placeholder="分类名称" required />
      <input v-model="newCat.description" class="input" placeholder="描述" />
      <select v-model="newCat.parentId" class="input">
        <option :value="null">顶级分类</option>
        <option v-for="cat in list" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <button type="button" class="btn-primary" @click="create">创建</button>
    </form>

    <div class="card space-y-2">
      <div v-for="cat in tree" :key="cat.id" class="border-b py-2 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <span :style="{ paddingLeft: `${cat.depth * 20}px` }">
            {{ cat.depth > 0 ? '└ ' : '' }}{{ cat.name }}
            <span class="text-xs text-gray-400">({{ cat.slug }})</span>
          </span>
          <button class="text-red-500 text-sm hover:underline" @click="remove(cat.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const showForm = ref(false)
const newCat = reactive({ name: '', description: '', parentId: null as number | null })
const { data, refresh } = await useFetch('/api/categories')
const list = computed(() => data.value?.data || [])

/** 构建分类树（带 depth） */
const tree = computed(() => {
  const items = list.value as Array<{ id: number; name: string; slug: string; parentId: number | null }>
  const result: Array<{ id: number; name: string; slug: string; depth: number }> = []

  function walk(parentId: number | null, depth: number) {
    for (const cat of items.filter((c) => c.parentId === parentId)) {
      result.push({ id: cat.id, name: cat.name, slug: cat.slug, depth })
      walk(cat.id, depth + 1)
    }
  }
  walk(null, 0)
  return result
})

async function create() {
  await $fetch('/api/categories', { method: 'POST', body: newCat })
  newCat.name = ''
  newCat.description = ''
  newCat.parentId = null
  showForm.value = false
  refresh()
}

async function remove(id: number) {
  if (!confirm('确定删除？')) return
  await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  refresh()
}
</script>
