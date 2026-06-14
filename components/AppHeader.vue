<template>
  <header class="site-header">
    <div class="site-header-inner">
      <NuxtLink to="/" class="site-logo">{{ siteName }}</NuxtLink>

      <nav v-if="!isMobile" class="site-nav" aria-label="主导航">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="item.key"
          class="site-nav-link"
          :class="{ 'site-nav-link--active': selectedKeys.includes(item.key) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="site-header-actions">
        <template v-if="isLoggedIn">
          <NuxtLink to="/user/profile">
            <a-button type="link" size="small">{{ user?.username }}</a-button>
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin">
            <a-button type="link" size="small">后台</a-button>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login">
            <a-button type="link" size="small">登录</a-button>
          </NuxtLink>
          <NuxtLink to="/register">
            <a-button type="primary" size="small">注册</a-button>
          </NuxtLink>
        </template>

        <NuxtLink to="/rss.xml" target="_blank">
          <a-button type="text" size="small">RSS</a-button>
        </NuxtLink>

        <a-button v-if="isMobile" type="text" size="small" aria-label="菜单" @click="drawerOpen = true">
          <MenuOutlined />
        </a-button>
      </div>
    </div>

    <a-drawer v-model:open="drawerOpen" placement="right" title="导航" :width="280">
      <a-menu mode="inline" :selected-keys="selectedKeys" :items="menuItems" @click="onDrawerNavClick" />
      <a-divider />
      <a-space direction="vertical" style="width: 100%">
        <NuxtLink v-if="!isLoggedIn" to="/login" @click="drawerOpen = false">
          <a-button block>登录</a-button>
        </NuxtLink>
        <NuxtLink v-if="!isLoggedIn" to="/register" @click="drawerOpen = false">
          <a-button type="primary" block>注册</a-button>
        </NuxtLink>
      </a-space>
    </a-drawer>
  </header>
</template>

<script setup lang="ts">
import { MenuOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'

const config = useRuntimeConfig()
const siteName = config.public.siteName
const route = useRoute()
const drawerOpen = ref(false)
const isMobile = ref(false)
const { user, isLoggedIn, isAdmin, fetchUser } = useAuth()

const navItems = [
  { key: '/', label: '首页' },
  { key: '/archive', label: '归档' },
  { key: '/authors', label: '作者' },
  { key: '/about', label: '关于' },
  { key: '/search', label: '搜索' },
]

const menuItems: MenuProps['items'] = navItems.map(item => ({
  key: item.key,
  label: item.label,
}))

const selectedKeys = computed(() => {
  const path = route.path
  if (path === '/') return ['/']
  const match = navItems.find(item => item.key !== '/' && path.startsWith(item.key))
  return match ? [match.key] : []
})

onMounted(() => {
  fetchUser()
  const mq = window.matchMedia('(max-width: 768px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', (e) => { isMobile.value = e.matches })
})

function onDrawerNavClick({ key }: { key: string }) {
  drawerOpen.value = false
  navigateTo(key)
}
</script>
