<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <NuxtLink to="/" class="text-xl font-bold text-primary-600 dark:text-primary-400">
        {{ siteName }}
      </NuxtLink>

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink to="/" class="nav-link">首页</NuxtLink>
        <NuxtLink to="/archive" class="nav-link">归档</NuxtLink>
        <NuxtLink to="/about" class="nav-link">关于</NuxtLink>
        <NuxtLink to="/search" class="nav-link">搜索</NuxtLink>
      </nav>

      <div class="flex items-center gap-3">
        <template v-if="isLoggedIn">
          <NuxtLink to="/user/profile" class="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-300">
            {{ user?.username }}
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" class="text-sm text-primary-600 hover:underline">后台</NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-sm text-gray-600 hover:text-primary-600">登录</NuxtLink>
          <NuxtLink to="/register" class="btn-primary px-3 py-1.5 text-xs">注册</NuxtLink>
        </template>

        <button class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="切换主题" @click="toggleDark()">
          <span v-if="colorMode.value === 'dark'">☀️</span>
          <span v-else>🌙</span>
        </button>
        <NuxtLink to="/rss.xml" class="hidden text-sm text-gray-500 hover:text-primary-600 sm:inline" target="_blank">RSS</NuxtLink>
        <button class="md:hidden" aria-label="菜单" @click="mobileOpen = !mobileOpen">☰</button>
      </div>
    </div>

    <div v-if="mobileOpen" class="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-700">
      <nav class="flex flex-col gap-2">
        <NuxtLink to="/" class="nav-link" @click="mobileOpen = false">首页</NuxtLink>
        <NuxtLink to="/archive" class="nav-link" @click="mobileOpen = false">归档</NuxtLink>
        <NuxtLink to="/about" class="nav-link" @click="mobileOpen = false">关于</NuxtLink>
        <NuxtLink to="/search" class="nav-link" @click="mobileOpen = false">搜索</NuxtLink>
        <NuxtLink v-if="!isLoggedIn" to="/login" class="nav-link" @click="mobileOpen = false">登录</NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = config.public.siteName
const colorMode = useColorMode()
const mobileOpen = ref(false)
const { user, isLoggedIn, isAdmin, fetchUser } = useAuth()

onMounted(() => fetchUser())

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<style scoped>
.nav-link {
  @apply text-sm text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400;
}
</style>
