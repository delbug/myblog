<template>
  <div>
    <AdminPageHeader title="角色权限" :breadcrumb="[{ label: '角色权限' }]" />

    <a-spin :spinning="pending">
      <a-space direction="vertical" size="large" style="width: 100%">
        <a-card v-for="role in roles" :key="role" :title="roleLabel(role)">
          <template #extra>
            <a-button type="primary" :loading="saving === role" @click="saveRole(role)">保存</a-button>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col v-for="group in permissionGroups" :key="group.name" :xs="24" :md="12" :xl="8">
              <a-typography-text type="secondary" strong>{{ group.name }}</a-typography-text>
              <a-checkbox-group v-model:value="selected[role]" class="mt-2 flex flex-col gap-1">
                <a-checkbox v-for="perm in group.items" :key="perm.code" :value="perm.code">
                  {{ perm.name }}
                  <a-typography-text code class="ml-1">{{ perm.code }}</a-typography-text>
                </a-checkbox>
              </a-checkbox-group>
            </a-col>
          </a-row>
        </a-card>
      </a-space>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

interface Permission {
  id: number
  code: string
  name: string
  groupName: string | null
}

const { data, pending, refresh } = await useFetch('/api/admin/roles')
const saving = ref<string | null>(null)

const roles = computed(() => (data.value?.data?.roles || ['admin', 'user']) as string[])
const allPermissions = computed(() => (data.value?.data?.allPermissions || []) as Permission[])

const selected = reactive<Record<string, string[]>>({ admin: [], user: [] })

watch(data, (val) => {
  if (!val?.data?.rolePermissions) return
  for (const role of roles.value) {
    selected[role] = [...(val.data.rolePermissions[role]?.codes || [])]
  }
}, { immediate: true })

const permissionGroups = computed(() => {
  const map = new Map<string, Permission[]>()
  for (const p of allPermissions.value) {
    const g = p.groupName || '其他'
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(p)
  }
  return [...map.entries()].map(([name, items]) => ({ name, items }))
})

function roleLabel(role: string) {
  return role === 'admin' ? '管理员' : '普通用户'
}

async function saveRole(role: string) {
  saving.value = role
  try {
    await $fetch(`/api/admin/roles/${role}`, {
      method: 'PUT',
      body: { permissionCodes: selected[role] },
    })
    await refresh()
    message.success('保存成功')
  } catch (e: unknown) {
    message.error((e as { data?: { message?: string } })?.data?.message || '保存失败')
  } finally {
    saving.value = null
  }
}
</script>
