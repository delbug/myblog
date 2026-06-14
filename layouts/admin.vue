<template>
  <a-config-provider :locale="zhCN">
    <div class="admin-app">
      <a-layout style="min-height: 100vh">
        <a-layout-sider
          v-model:collapsed="collapsed"
          collapsible
          :width="220"
          theme="dark"
          :trigger="null"
        >
          <div class="flex h-14 items-center justify-center text-white font-semibold text-base">
            {{ collapsed ? 'B' : 'Blog Admin' }}
          </div>
          <a-menu
            theme="dark"
            mode="inline"
            :selected-keys="selectedMenuKeys"
            :items="menuItems"
            @click="onMenuClick"
          />
        </a-layout-sider>

        <a-layout>
          <a-layout-header class="admin-header flex items-center justify-between bg-white px-6 shadow-sm">
            <a-space>
              <a-button type="text" @click="collapsed = !collapsed">
                <MenuFoldOutlined v-if="!collapsed" />
                <MenuUnfoldOutlined v-else />
              </a-button>
              <a-typography-text type="secondary">{{ user?.username }} · {{ user?.role }}</a-typography-text>
            </a-space>
            <a-space>
              <a-button type="link" @click="navigateTo('/admin/api-docs')">API 文档</a-button>
              <a-button type="link" @click="navigateTo('/')">前台</a-button>
              <a-dropdown>
                <a-space class="cursor-pointer">
                  <a-avatar size="small">{{ user?.username?.[0]?.toUpperCase() || 'A' }}</a-avatar>
                  <DownOutlined />
                </a-space>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="logout" @click="logout">
                      <LogoutOutlined /> 退出登录
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-space>
          </a-layout-header>

          <a-layout-content style="padding: 16px">
            <AdminTabs />
            <div class="admin-content">
              <slot />
            </div>
          </a-layout-content>
        </a-layout>
      </a-layout>

      <AdminLockScreen />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue'
import { resolveAdminMenuIcon } from '~/utils/adminMenuIcon'
import type { MenuProps } from 'ant-design-vue'

const collapsed = ref(false)
const { user, logout: authLogout, fetchUser } = useAuth()
const { fetchPermissions } = usePermission()
const { menus, fetchMenus } = useAdminMenu()
const { openTab } = useAdminTabs()
const route = useRoute()

const fallbackNav = [
  { path: '/admin', label: '仪表盘', icon: '📊' },
  { path: '/admin/posts', label: '文章管理', icon: '📝' },
  { path: '/admin/posts/trash', label: '回收站', icon: '🗑️' },
  { path: '/admin/settings', label: '站点设置', icon: '⚙️' },
]

const navItems = computed(() => {
  if (menus.value.length) {
    return menus.value.map((m) => ({ path: m.path, label: m.label, icon: m.icon || '📄' }))
  }
  return fallbackNav
})

const menuItems = computed<MenuProps['items']>(() =>
  navItems.value.map((item) => ({
    key: item.path,
    label: item.label,
    icon: () => h(resolveAdminMenuIcon(item.icon)),
  })),
)

const selectedMenuKeys = computed(() => {
  const path = route.path
  const match = navItems.value
    .filter((item) => path === item.path || (item.path !== '/admin' && path.startsWith(`${item.path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0]
  return match ? [match.path] : []
})

await fetchUser()
await fetchPermissions()
await fetchMenus()

watch(() => route.path, () => {
  const item = navItems.value.find((n) => n.path === route.path)
  if (item) openTab(item.label, item.path)
}, { immediate: true })

function onMenuClick({ key }: { key: string | number }) {
  const path = String(key)
  const item = navItems.value.find((n) => n.path === path)
  if (item) openTab(item.label, item.path)
  navigateTo(path)
}

async function logout() {
  await authLogout()
  navigateTo('/admin/login')
}
</script>

<style scoped>
.admin-header {
  height: 56px;
  line-height: 56px;
  padding-inline: 24px;
}
</style>
