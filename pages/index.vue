<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">最新文章</h1>
          <div class="flex gap-2 text-sm">
            <button
              class="rounded px-3 py-1"
              :class="orderBy === 'latest' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'"
              @click="setOrder('latest')"
            >
              最新
            </button>
            <button
              class="rounded px-3 py-1"
              :class="orderBy === 'popular' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'"
              @click="setOrder('popular')"
            >
              热门
            </button>
          </div>
        </div>

        <PostCard v-for="post in posts" :key="post.id" :post="post" />

        <p v-if="posts.length === 0" class="text-center text-gray-500">暂无文章</p>

        <Pagination
          :page="page"
          :total="total"
          :page-size="pageSize"
          @change="onPageChange"
        />
      </div>

      <Sidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 首页：文章列表 + 侧边栏
 */
const page = ref(1)
const pageSize = 10
const orderBy = ref<'latest' | 'popular'>('latest')

const config = useRuntimeConfig()
usePageSeo({
  title: '首页',
  description: config.public.siteDescription as string,
})

const { data, refresh } = await useFetch('/api/posts', {
  query: computed(() => ({ page: page.value, pageSize, orderBy: orderBy.value })),
})

const posts = computed(() => data.value?.data?.list || [])
const total = computed(() => data.value?.data?.total || 0)

/** 切换排序方式 */
function setOrder(order: 'latest' | 'popular') {
  orderBy.value = order
  page.value = 1
  refresh()
}

/** 翻页 */
function onPageChange(p: number) {
  page.value = p
  refresh()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
