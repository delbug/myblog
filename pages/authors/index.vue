<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold">作者专栏</h1>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="author in authors"
        :key="author.id"
        :to="`/authors/${author.username}`"
        class="card transition-shadow hover:shadow-md"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900/40">
            {{ author.username.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="font-semibold">{{ author.username }}</h2>
            <p class="text-sm text-gray-500">{{ author.postCount }} 篇文章</p>
          </div>
        </div>
        <p v-if="author.bio" class="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{{ author.bio }}</p>
      </NuxtLink>
    </div>
    <p v-if="!authors.length" class="text-gray-500">暂无作者</p>
  </div>
</template>

<script setup lang="ts">
usePageSeo({ title: '作者专栏', description: '博客作者列表' })

const { data } = await useFetch('/api/authors')
const authors = computed(() => data.value?.data || [])
</script>
