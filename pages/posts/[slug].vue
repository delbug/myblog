<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <article v-if="post" class="lg:col-span-2">
        <header class="mb-8">
          <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" class="mb-6 max-h-80 w-full rounded-xl object-cover" />
          <h1 class="text-3xl font-bold leading-tight">{{ post.title }}</h1>
          <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <NuxtLink v-if="post.author" :to="`/authors/${post.author.username}`" class="font-medium text-primary-600 hover:underline">
              {{ post.author.username }}
            </NuxtLink>
            <span>{{ formatDate(post.publishedAt || post.createdAt, 'YYYY年MM月DD日') }}</span>
            <span v-if="post.category">
              <NuxtLink :to="`/categories/${post.category.slug}`" class="text-primary-600 hover:underline">
                {{ post.category.name }}
              </NuxtLink>
            </span>
            <span>{{ post.viewCount }} 阅读</span>
            <span>{{ post.likeCount || 0 }} 点赞</span>
            <span>{{ post.commentCount }} 评论</span>
          </div>
          <div class="mt-4 flex gap-3">
            <button class="btn-secondary text-sm" :class="{ 'text-red-500': liked }" @click="toggleLike">
              {{ liked ? '❤️ 已赞' : '🤍 点赞' }} ({{ post.likeCount || 0 }})
            </button>
            <button class="btn-secondary text-sm" :class="{ 'text-yellow-500': favorited }" @click="toggleFavorite">
              {{ favorited ? '⭐ 已收藏' : '☆ 收藏' }}
            </button>
          </div>
          <div v-if="post.tags.length" class="mt-3 flex flex-wrap gap-2">
            <NuxtLink
              v-for="tag in post.tags"
              :key="tag.id"
              :to="`/tags/${tag.slug}`"
              class="rounded bg-gray-100 px-2 py-0.5 text-xs hover:bg-primary-100 dark:bg-gray-800"
            >
              #{{ tag.name }}
            </NuxtLink>
          </div>
        </header>

        <!-- Markdown 渲染内容 -->
        <div class="prose-blog" v-html="post.htmlContent" />

        <!-- 相关文章 -->
        <section v-if="post.related?.length" class="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <h3 class="mb-4 text-lg font-semibold">相关文章</h3>
          <ul class="space-y-2">
            <li v-for="item in post.related" :key="item.id">
              <NuxtLink :to="`/posts/${item.slug}`" class="text-primary-600 hover:underline">
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
        </section>

        <CommentSection :post-id="post.id" />
      </article>

      <Sidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

/**
 * 文章详情页
 * SSR 渲染完整 HTML，利于 SEO
 */
const route = useRoute()
const slug = route.params.slug as string

const { data, error, refresh } = await useFetch(`/api/posts/${slug}`)

if (error.value || !data.value?.data) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const post = computed(() => data.value!.data)
const liked = ref(false)
const favorited = ref(false)
const { isLoggedIn } = useAuth()

async function toggleLike() {
  if (!isLoggedIn.value) return navigateTo('/login')
  const res = await $fetch(`/api/posts/${post.value.id}/like`, { method: 'POST' })
  liked.value = res.data.liked
  refresh()
}

async function toggleFavorite() {
  if (!isLoggedIn.value) return navigateTo('/login')
  const res = await $fetch(`/api/posts/${post.value.id}/favorite`, { method: 'POST' })
  favorited.value = res.data.favorited
}

// 动态 SEO Meta + JSON-LD
usePageSeo({
  title: post.value.title,
  description: post.value.summary || undefined,
  image: post.value.coverImage || undefined,
  type: 'article',
  publishedTime: post.value.publishedAt || post.value.createdAt,
  modifiedTime: post.value.updatedAt,
  author: post.value.author?.username,
  keywords: post.value.tags?.map((t: { name: string }) => t.name),
})
</script>

<style>
@import 'highlight.js/styles/github-dark.css';
</style>
