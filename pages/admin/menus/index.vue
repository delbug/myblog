<template>
  <div>
    <AdminPageHeader title="动态菜单管理" :breadcrumb="[{ label: '菜单管理' }]">
      <template #extra>
        <a-button type="primary" @click="openCreate">新增菜单</a-button>
      </template>
    </AdminPageHeader>

    <AdminDynamicTable :columns="columns" :data="menus" :searchable="false" row-key="id">
      <template #col-enabled="{ value }">
        <a-badge :status="value ? 'success' : 'default'" :text="value ? '启用' : '禁用'" />
      </template>
      <template #actions="{ row }">
        <a-space>
          <a-button type="link" size="small" @click="editRow(row)">编辑</a-button>
          <a-button type="link" size="small" danger @click="removeRow(Number(row.id))">删除</a-button>
        </a-space>
      </template>
    </AdminDynamicTable>

    <a-modal
      v-model:open="showForm"
      :title="form.id ? '编辑菜单' : '新增菜单'"
      ok-text="保存"
      cancel-text="取消"
      @ok="saveMenu"
    >
      <a-form layout="vertical">
        <a-form-item label="名称" required>
          <a-input v-model:value="form.label" placeholder="菜单名称" />
        </a-form-item>
        <a-form-item label="路径" required>
          <a-input v-model:value="form.path" placeholder="/admin/xxx" />
        </a-form-item>
        <a-form-item label="图标">
          <a-input v-model:value="form.icon" placeholder="emoji 或留空" />
        </a-form-item>
        <a-form-item label="权限码">
          <a-input v-model:value="form.permissionCode" placeholder="可空" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="form.sortOrder" style="width: 100%" />
        </a-form-item>
        <a-form-item label="启用">
          <a-switch v-model:checked="enabledSwitch" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'
import type { TableColumn } from '~/components/admin/AdminDynamicTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 70 },
  { key: 'label', title: '名称' },
  { key: 'path', title: '路径' },
  { key: 'icon', title: '图标', width: 80 },
  { key: 'permissionCode', title: '权限码' },
  { key: 'sortOrder', title: '排序', width: 80 },
  { key: 'enabled', title: '状态', width: 90 },
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

const enabledSwitch = computed({
  get: () => form.enabled === 1,
  set: (v: boolean) => { form.enabled = v ? 1 : 0 },
})

function openCreate() {
  closeForm()
  showForm.value = true
}

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

  showForm.value = false
  closeForm()
  message.success('菜单已保存')
  refresh()
  await useAdminMenu().fetchMenus()
}

function removeRow(id: number) {
  Modal.confirm({
    title: '删除菜单？',
    okType: 'danger',
    onOk: async () => {
      await $fetch(`/api/admin/menus/manage/${id}`, { method: 'DELETE' })
      message.success('已删除')
      refresh()
      await useAdminMenu().fetchMenus()
    },
  })
}
</script>
