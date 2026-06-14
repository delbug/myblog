<template>
  <div class="site-container" style="max-width: 720px">
    <a-typography-title :level="1">搜索</a-typography-title>

    <a-input-search
      v-model:value="keyword"
      placeholder="输入关键词搜索..."
      enter-button="搜索"
      size="large"
      style="margin: 24px 0"
      autofocus
      @search="search"
    />

    <a-space v-if="keyword" style="margin-bottom: 16px">
      <a-typography-text type="secondary">搜索 "{{ keyword }}" 共找到 {{ total }} 篇文章</a-typography-text>
      <a-tag v-if="engine">{{ engineLabel }}</a-tag>
    </a-space>

    <a-list v-if="posts.length" item-layout="vertical" :data-source="posts">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <NuxtLink :to="`/posts/${item.slug}`">
                <span v-if="item._formatted?.title" v-html="item._formatted.title" />
                <span v-else>{{ item.title }}</span>
              </NuxtLink>
            </template>
            <template #description>
              <span v-if="item._formatted?.summary" v-html="item._formatted.summary" />
              <span v-else>{{ item.summary }}</span>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>

    <a-empty v-else-if="keyword" description="未找到相关文章" />

    <Pagination
      v-if="total > pageSize"
      :page="page"
      :total="total"
      :page-size="pageSize"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
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
