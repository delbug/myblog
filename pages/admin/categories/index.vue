<template>
  <div>
    <AdminPageHeader title="分类管理" :breadcrumb="[{ label: '分类管理' }]">
      <template #extra>
        <a-button type="primary" @click="showForm = !showForm">{{ showForm ? '取消' : '新建分类' }}</a-button>
      </template>
    </AdminPageHeader>

    <a-card v-if="showForm" class="mb-4">
      <a-form layout="vertical" @finish="create">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="分类名称" required>
              <a-input v-model:value="newCat.name" placeholder="分类名称" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="描述">
              <a-input v-model:value="newCat.description" placeholder="描述" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="父分类">
              <a-select v-model:value="newCat.parentId" allow-clear placeholder="顶级分类">
                <a-select-option v-for="cat in list" :key="cat.id" :value="cat.id">{{ cat.name }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-button type="primary" html-type="submit">创建</a-button>
      </a-form>
    </a-card>

    <a-table :columns="tableColumns" :data-source="tree" row-key="id" size="middle" bordered :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <span :style="{ paddingLeft: `${record.depth * 20}px` }">
            {{ record.depth > 0 ? '└ ' : '' }}{{ record.name }}
            <a-typography-text type="secondary" class="ml-2">({{ record.slug }})</a-typography-text>
          </span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-button type="link" size="small" danger @click="remove(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const showForm = ref(false)
const newCat = reactive({ name: '', description: '', parentId: null as number | null })
const { data, refresh } = await useFetch('/api/categories')
const list = computed(() => data.value?.data || [])

const tableColumns = [
  { title: '分类', key: 'name' },
  { title: '操作', key: 'actions', width: 100 },
]

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
  message.success('分类已创建')
  refresh()
}

function remove(id: number) {
  Modal.confirm({
    title: '删除分类？',
    okType: 'danger',
    onOk: async () => {
      await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      message.success('已删除')
      refresh()
    },
  })
}
</script>
