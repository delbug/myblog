<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <aside
      class="fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gray-200 bg-white transition-all dark:border-gray-700 dark:bg-gray-800"
      :class="collapsed ? 'w-16' : 'w-56'"
    >
      <div class="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-700">
        <span v-if="!collapsed" class="font-bold text-primary-600">Blog Admin</span>
        <span v-else class="mx-auto font-bold text-primary-600">B</span>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          active-class="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
          @click="openTab(item.label, item.to)"
        >
          <span>{{ item.icon }}</span>
          <span v-if="!collapsed">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <div class="flex min-h-screen flex-1 flex-col" :class="collapsed ? 'ml-16' : 'ml-56'">
      <header class="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <button class="text-gray-500" @click="collapsed = !collapsed">☰</button>
          <span class="text-sm text-gray-500">{{ user?.username }} ({{ user?.role }})</span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/api-docs" class="text-sm text-gray-500 hover:text-primary-600">API 文档</NuxtLink>
          <NuxtLink to="/" class="text-sm text-primary-600 hover:underline">前台</NuxtLink>
          <button class="text-sm text-red-500" @click="logout">退出</button>
        </div>
      </header>

      <main class="flex-1 p-6">
        <AdminTabs />
        <slot />
      </main>
    </div>

    <AdminLockScreen />
  </div>
</template>

<script setup lang="ts">
const collapsed = ref(false)
const { user, logout: authLogout, fetchUser } = useAuth()
const { fetchPermissions } = usePermission()
const { menus, fetchMenus } = useAdminMenu()
const { openTab } = useAdminTabs()
const route = useRoute()

/** 动态菜单（API 失败时使用静态兜底） */
const fallbackNav = [
  { to: '/admin', label: '仪表盘', icon: '📊' },
  { to: '/admin/posts', label: '文章管理', icon: '📝' },
  { to: '/admin/posts/trash', label: '回收站', icon: '🗑️' },
  { to: '/admin/settings', label: '站点设置', icon: '⚙️' },
]

const navItems = computed(() => {
  if (menus.value.length) {
    return menus.value.map((m) => ({ to: m.path, label: m.label, icon: m.icon || '📄' }))
  }
  return fallbackNav
})

await fetchUser()
await fetchPermissions()
await fetchMenus()

watch(() => route.path, () => {
  const item = navItems.value.find((n) => n.to === route.path)
  if (item) openTab(item.label, item.to)
}, { immediate: true })

async function logout() {
  await authLogout()
  navigateTo('/admin/login')
}
</script>
