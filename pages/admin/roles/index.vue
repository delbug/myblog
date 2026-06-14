<template>
  <div>
    <AdminBreadcrumb :items="[{ label: '角色权限' }]" />
    <h1 class="mb-6 text-2xl font-bold">角色权限管理</h1>

    <div v-if="pending" class="text-gray-500">加载中...</div>

    <div v-else class="space-y-8">
      <section v-for="role in roles" :key="role" class="card">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold capitalize">{{ roleLabel(role) }}</h2>
          <button class="btn-primary" :disabled="saving === role" @click="saveRole(role)">
            {{ saving === role ? '保存中...' : '保存' }}
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="group in permissionGroups" :key="group.name">
            <h3 class="mb-2 text-sm font-medium text-gray-500">{{ group.name }}</h3>
            <label v-for="perm in group.items" :key="perm.code" class="mb-1 flex items-center gap-2 text-sm">
              <input v-model="selected[role]" type="checkbox" :value="perm.code" />
              {{ perm.name }}
              <code class="text-xs text-gray-400">{{ perm.code }}</code>
            </label>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
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
    alert('保存成功')
  } catch (e: unknown) {
    alert((e as { data?: { message?: string } })?.data?.message || '保存失败')
  } finally {
    saving.value = null
  }
}
</script>
