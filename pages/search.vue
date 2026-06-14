<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">搜索</h1>

    <form class="mb-8 flex gap-2" @submit.prevent="search">
      <input v-model="keyword" class="input flex-1" placeholder="输入关键词搜索..." autofocus />
      <button type="submit" class="btn-primary">搜索</button>
    </form>

    <p v-if="keyword" class="mb-4 text-sm text-gray-500">
      搜索 "{{ keyword }}" 共找到 {{ total }} 篇文章
      <span v-if="engine" class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{{ engineLabel }}</span>
    </p>

    <div class="space-y-6">
      <article v-for="post in posts" :key="post.id" class="card">
        <NuxtLink :to="`/posts/${post.slug}`" class="text-lg font-semibold text-primary-600 hover:underline">
          <span v-if="post._formatted?.title" v-html="post._formatted.title" />
          <span v-else>{{ post.title }}</span>
        </NuxtLink>
        <p v-if="post._formatted?.summary || post.summary" class="mt-2 text-sm text-gray-500">
          <span v-if="post._formatted?.summary" v-html="post._formatted.summary" />
          <span v-else>{{ post.summary }}</span>
        </p>
      </article>
      <p v-if="keyword && posts.length === 0" class="text-gray-500">未找到相关文章</p>
    </div>

    <Pagination
      v-if="total > pageSize"
      class="mt-8"
      :page="page"
      :total="total"
      :page-size="pageSize"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
/** 搜索页（Meilisearch 优先，未配置时 MySQL 回退） */
const route = useRoute()
const keyword = ref((route.query.keyword as string) || '')
const page = ref(1)
const pageSize = 10

usePageSeo({ title: '搜索', description: '搜索博客文章' })

const { data, refresh } = await useFetch('/api/search', {
  query: computed(() => ({
    page: page.value,
    pageSize,
    keyword: keyword.value || undefined,
  })),
  immediate: !!keyword.value,
})

interface SearchPost {
  id: number
  title: string
  slug: string
  summary?: string | null
  _formatted?: { title?: string; summary?: string }
}

const posts = computed(() => (data.value?.data?.list || []) as SearchPost[])
const total = computed(() => data.value?.data?.total || 0)
const engine = computed(() => data.value?.data?.engine as string | undefined)

const engineLabel = computed(() => {
  if (engine.value === 'meilisearch') return 'Meilisearch'
  if (engine.value === 'mysql') return 'MySQL'
  return ''
})

function search() {
  page.value = 1
  navigateTo({ path: '/search', query: { keyword: keyword.value } })
  refresh()
}

function onPageChange(p: number) {
  page.value = p
  refresh()
}
</script>
