<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold">文章归档</h1>

    <div v-for="(items, month) in archive" :key="month" class="mb-8">
      <h2 class="mb-4 text-lg font-semibold text-primary-600">{{ month }}</h2>
      <ul class="space-y-2 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
        <li v-for="post in items" :key="post.id">
          <NuxtLink :to="`/posts/${post.slug}`" class="text-gray-700 hover:text-primary-600 dark:text-gray-300">
            {{ post.title }}
          </NuxtLink>
          <span class="ml-2 text-xs text-gray-400">
            {{ formatDate(post.publishedAt) }}
          </span>
        </li>
      </ul>
    </div>

    <p v-if="!archive || Object.keys(archive).length === 0" class="text-gray-500">暂无归档</p>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

/** 文章归档页（按年月分组） */
usePageSeo({ title: '归档', description: '按时间浏览所有文章' })

const { data } = await useFetch('/api/archive')
const archive = computed(() => data.value?.data || {})
</script>
