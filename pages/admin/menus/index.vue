<template>
  <div>
    <AdminBreadcrumb :items="[{ label: '菜单管理' }]" />
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">动态菜单管理</h1>
      <button class="btn-primary" @click="showForm = true">新增菜单</button>
    </div>

    <AdminDynamicTable :columns="columns" :data="menus" row-key="id">
      <template #col-enabled="{ value }">{{ value ? '启用' : '禁用' }}</template>
      <template #actions="{ row }">
        <button class="mr-2 text-primary-600 hover:underline" @click="editRow(row)">编辑</button>
        <button class="text-red-500 hover:underline" @click="removeRow(Number(row.id))">删除</button>
      </template>
    </AdminDynamicTable>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form class="card w-full max-w-md space-y-3" @submit.prevent="saveMenu">
        <h2 class="text-lg font-semibold">{{ form.id ? '编辑菜单' : '新增菜单' }}</h2>
        <input v-model="form.label" class="input" placeholder="名称" required />
        <input v-model="form.path" class="input" placeholder="路径 /admin/xxx" required />
        <input v-model="form.icon" class="input" placeholder="图标 emoji" />
        <input v-model="form.permissionCode" class="input" placeholder="权限码（可空）" />
        <input v-model.number="form.sortOrder" class="input" type="number" placeholder="排序" />
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.enabled" type="checkbox" :true-value="1" :false-value="0" />
          启用
        </label>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary">保存</button>
          <button type="button" class="btn-secondary" @click="closeForm">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '~/components/admin/AdminDynamicTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const columns: TableColumn[] = [
  { key: 'id', title: 'ID' },
  { key: 'label', title: '名称' },
  { key: 'path', title: '路径' },
  { key: 'icon', title: '图标' },
  { key: 'permissionCode', title: '权限码' },
  { key: 'sortOrder', title: '排序' },
  { key: 'enabled', title: '状态' },
]

const { data, refresh } = await useFetch('/api/admin/menus/manage')
const menus = computed(() => (data.value?.data || []) as Record<string, unknown>[])

const showForm = ref(false)
const form = reactive({
  id: 0,
  label: '',
  path: '',
  icon: '',
  permissionCode: '',
  sortOrder: 0,
  enabled: 1,
})

function editRow(row: Record<string, unknown>) {
  form.id = Number(row.id)
  form.label = String(row.label)
  form.path = String(row.path)
  form.icon = String(row.icon || '')
  form.permissionCode = String(row.permissionCode || '')
  form.sortOrder = Number(row.sortOrder || 0)
  form.enabled = Number(row.enabled ?? 1)
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  form.id = 0
  form.label = ''
  form.path = ''
  form.icon = ''
  form.permissionCode = ''
  form.sortOrder = 0
  form.enabled = 1
}

async function saveMenu() {
  const body = {
    label: form.label,
    path: form.path,
    icon: form.icon || undefined,
    permissionCode: form.permissionCode || null,
    sortOrder: form.sortOrder,
    enabled: form.enabled,
  }

  if (form.id) {
    await $fetch(`/api/admin/menus/manage/${form.id}`, { method: 'PUT', body })
  } else {
    await $fetch('/api/admin/menus/manage', { method: 'POST', body })
  }

  closeForm()
  refresh()
  await useAdminMenu().fetchMenus()
}

async function removeRow(id: number) {
  if (!confirm('确定删除该菜单？')) return
  await $fetch(`/api/admin/menus/manage/${id}`, { method: 'DELETE' })
  refresh()
  await useAdminMenu().fetchMenus()
}
</script>
