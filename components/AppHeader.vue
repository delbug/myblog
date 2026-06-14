<template>
  <a-layout-header class="site-header">
    <div class="site-header-inner">
      <NuxtLink to="/" class="site-logo">{{ siteName }}</NuxtLink>

      <a-menu
        v-if="!isMobile"
        mode="horizontal"
        :selected-keys="selectedKeys"
        :items="navItems"
        class="site-menu"
        @click="onNavClick"
      />

      <a-space>
        <template v-if="isLoggedIn">
          <NuxtLink to="/user/profile">
            <a-button type="link">{{ user?.username }}</a-button>
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin">
            <a-button type="link">后台</a-button>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login">
            <a-button type="link">登录</a-button>
          </NuxtLink>
          <NuxtLink to="/register">
            <a-button type="primary" size="small">注册</a-button>
          </NuxtLink>
        </template>

        <a-button type="text" aria-label="切换主题" @click="toggleDark()">
          <BulbFilled v-if="colorMode.value === 'dark'" />
          <BulbOutlined v-else />
        </a-button>

        <NuxtLink to="/rss.xml" target="_blank">
          <a-button type="text" size="small">RSS</a-button>
        </NuxtLink>

        <a-button v-if="isMobile" type="text" aria-label="菜单" @click="drawerOpen = true">
          <MenuOutlined />
        </a-button>
      </a-space>
    </div>

    <a-drawer v-model:open="drawerOpen" placement="right" title="导航" :width="280">
      <a-menu mode="inline" :selected-keys="selectedKeys" :items="navItems" @click="onDrawerNavClick" />
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
  </a-layout-header>
</template>

<script setup lang="ts">
import { BulbFilled, BulbOutlined, MenuOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'

const config = useRuntimeConfig()
const siteName = config.public.siteName
const route = useRoute()
const colorMode = useColorMode()
const drawerOpen = ref(false)
const isMobile = ref(false)
const { user, isLoggedIn, isAdmin, fetchUser } = useAuth()

const navItems: MenuProps['items'] = [
  { key: '/', label: '首页' },
  { key: '/archive', label: '归档' },
  { key: '/authors', label: '作者' },
  { key: '/about', label: '关于' },
  { key: '/search', label: '搜索' },
]

const selectedKeys = computed(() => {
  const path = route.path
  if (path === '/') return ['/']
  const match = navItems?.find(item => item?.key !== '/' && path.startsWith(String(item?.key)))
  return match ? [String(match.key)] : []
})

onMounted(() => {
  fetchUser()
  const mq = window.matchMedia('(max-width: 768px)')
  isMobile.value = mq.matches
  mq.addEventListener('change', (e) => { isMobile.value = e.matches })
})

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

function onNavClick({ key }: { key: string }) {
  navigateTo(key)
}

function onDrawerNavClick({ key }: { key: string }) {
  drawerOpen.value = false
  navigateTo(key)
}
</script>
