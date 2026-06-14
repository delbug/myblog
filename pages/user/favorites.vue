<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">我的收藏</h1>
    <div v-if="!isLoggedIn" class="card text-center">
      <NuxtLink to="/login" class="btn-primary">请先登录</NuxtLink>
    </div>
    <div v-else class="space-y-4">
      <div v-for="item in list" :key="item.id" class="card">
        <NuxtLink :to="`/posts/${item.slug}`" class="text-lg font-semibold hover:text-primary-600">{{ item.title }}</NuxtLink>
        <p v-if="item.summary" class="mt-1 text-sm text-gray-500">{{ item.summary }}</p>
      </div>
      <p v-if="list.length === 0" class="text-gray-500">暂无收藏</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, fetchUser } = useAuth()
await fetchUser()

const { data } = await useFetch('/api/user/favorites')
const list = computed(() => data.value?.data?.list || [])
</script>
