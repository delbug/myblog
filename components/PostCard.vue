<template>
  <article class="card transition-shadow hover:shadow-md">
    <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" class="mb-3 max-h-48 w-full rounded-lg object-cover" />

    <div v-if="post.isTop" class="mb-2">
      <span class="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">置顶</span>
    </div>

    <NuxtLink :to="`/posts/${post.slug}`" class="group">
      <h2 class="text-xl font-semibold text-gray-900 group-hover:text-primary-600 dark:text-gray-100 dark:group-hover:text-primary-400">
        {{ post.title }}
      </h2>
    </NuxtLink>

    <p v-if="post.summary" class="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
      {{ post.summary }}
    </p>

    <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
      <NuxtLink v-if="post.author" :to="`/authors/${post.author.username}`" class="hover:text-primary-600">
        {{ post.author.username }}
      </NuxtLink>
      <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
      <span v-if="post.category">
        <NuxtLink :to="`/categories/${post.category.slug}`" class="hover:text-primary-600">
          {{ post.category.name }}
        </NuxtLink>
      </span>
      <span>{{ post.viewCount }} 阅读</span>
      <div v-if="post.tags.length" class="flex flex-wrap gap-1">
        <NuxtLink
          v-for="tag in post.tags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="rounded bg-gray-100 px-2 py-0.5 hover:bg-primary-100 hover:text-primary-700 dark:bg-gray-700 dark:hover:bg-primary-900/30"
        >
          #{{ tag.name }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

/** 文章卡片组件，用于列表页展示 */
defineProps<{
  post: {
    id: number
    title: string
    slug: string
    summary: string | null
    viewCount: number
    isTop: number
    publishedAt: string | null
    createdAt: string
    category: { id: number; name: string; slug: string } | null
    tags: { id: number; name: string; slug: string }[]
    author?: { id: number; username: string; avatar: string | null }
    coverImage?: string | null
  }
}>()
</script>
