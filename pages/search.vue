<template>
  <div>
    <SitePageHeader title="搜索" description="输入关键词查找文章" />

    <SiteMainPanel>
      <a-input-search
        v-model:value="keyword"
        placeholder="输入关键词搜索..."
        enter-button="搜索"
        size="large"
        autofocus
        @search="search"
      />

      <a-space v-if="keyword" style="margin-top: 16px">
        <a-typography-text type="secondary">搜索 "{{ keyword }}" 共找到 {{ total }} 篇文章</a-typography-text>
        <a-tag v-if="engine">{{ engineLabel }}</a-tag>
      </a-space>

      <a-divider v-if="keyword" />

      <template v-if="posts.length">
        <a-card v-for="item in posts" :key="item.id" size="small" class="site-search-result" hoverable>
          <NuxtLink :to="`/posts/${item.slug}`">
            <a-typography-title :level="5" style="margin: 0">
              <span v-if="item._formatted?.title" v-html="item._formatted.title" />
              <span v-else>{{ item.title }}</span>
            </a-typography-title>
          </NuxtLink>
          <a-typography-paragraph v-if="item._formatted?.summary || item.summary" type="secondary" :ellipsis="{ rows: 2 }" style="margin-top: 8px; margin-bottom: 0">
            <span v-if="item._formatted?.summary" v-html="item._formatted.summary" />
            <span v-else>{{ item.summary }}</span>
          </a-typography-paragraph>
        </a-card>
      </template>

      <a-empty v-else-if="keyword" description="未找到相关文章" />

      <Pagination
        v-if="total > pageSize"
        :page="page"
        :total="total"
        :page-size="pageSize"
        @change="onPageChange"
      />
    </SiteMainPanel>
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
