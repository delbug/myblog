<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">搜索</h1>

    <form class="mb-8 flex gap-2" @submit.prevent="search">
      <input v-model="keyword" class="input flex-1" placeholder="输入关键词搜索..." autofocus />
      <button type="submit" class="btn-primary">搜索</button>
    </form>

    <p v-if="keyword" class="mb-4 text-sm text-gray-500">
      搜索 "{{ keyword }}" 共找到 {{ total }} 篇文章
    </p>

    <div class="space-y-6">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
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
/** 搜索页 */
const route = useRoute()
const keyword = ref((route.query.keyword as string) || '')
const page = ref(1)
const pageSize = 10

usePageSeo({ title: '搜索', description: '搜索博客文章' })

const { data, refresh } = await useFetch('/api/posts', {
  query: computed(() => ({
    page: page.value,
    pageSize,
    keyword: keyword.value || undefined,
  })),
  immediate: !!keyword.value,
})

const posts = computed(() => data.value?.data?.list || [])
const total = computed(() => data.value?.data?.total || 0)

/** 执行搜索 */
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
