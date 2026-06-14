<template>
  <a-card hoverable class="mb-4">
    <template v-if="post.coverImage" #cover>
      <NuxtLink :to="`/posts/${post.slug}`">
        <img :src="post.coverImage" :alt="post.title" class="site-post-cover">
      </NuxtLink>
    </template>

    <template #extra>
      <a-tag v-if="post.isTop" color="red">置顶</a-tag>
    </template>

    <NuxtLink :to="`/posts/${post.slug}`">
      <a-typography-title :level="4" style="margin: 0">{{ post.title }}</a-typography-title>
    </NuxtLink>

    <a-typography-paragraph v-if="post.summary" type="secondary" :ellipsis="{ rows: 2 }" style="margin-top: 8px">
      {{ post.summary }}
    </a-typography-paragraph>

    <a-space wrap size="small" style="margin-top: 12px">
      <NuxtLink v-if="post.author" :to="`/authors/${post.author.username}`">
        <a-typography-link>{{ post.author.username }}</a-typography-link>
      </NuxtLink>
      <a-typography-text type="secondary">{{ formatDate(post.publishedAt || post.createdAt) }}</a-typography-text>
      <NuxtLink v-if="post.category" :to="`/categories/${post.category.slug}`">
        <a-tag>{{ post.category.name }}</a-tag>
      </NuxtLink>
      <a-typography-text type="secondary">{{ post.viewCount }} 阅读</a-typography-text>
    </a-space>

    <div v-if="post.tags.length" style="margin-top: 8px">
      <a-space wrap size="small">
        <NuxtLink v-for="tag in post.tags" :key="tag.id" :to="`/tags/${tag.slug}`">
          <a-tag color="blue">{{ tag.name }}</a-tag>
        </NuxtLink>
      </a-space>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

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
