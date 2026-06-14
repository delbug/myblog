<template>
  <div class="container mx-auto max-w-lg px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">个人中心</h1>

    <div v-if="!isLoggedIn" class="card text-center">
      <p class="mb-4 text-gray-500">请先登录</p>
      <NuxtLink to="/login" class="btn-primary">去登录</NuxtLink>
    </div>

    <div v-else class="card space-y-4">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600">
          {{ user?.username?.[0]?.toUpperCase() }}
        </div>
        <div>
          <p class="text-lg font-semibold">{{ user?.username }}</p>
          <p class="text-sm text-gray-500">{{ user?.email || '未设置邮箱' }}</p>
          <span class="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs">{{ user?.role === 'admin' ? '管理员' : '普通用户' }}</span>
        </div>
      </div>

      <div v-if="user?.role === 'admin'">
        <NuxtLink to="/admin" class="btn-primary">进入管理后台</NuxtLink>
      </div>

      <button class="btn-secondary" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 用户个人中心 */
const { user, isLoggedIn, fetchUser, logout } = useAuth()

await fetchUser()

async function handleLogout() {
  await logout()
  navigateTo('/')
}
</script>
