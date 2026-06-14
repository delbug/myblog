<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid gap-8 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <h1 class="text-2xl font-bold">标签：#{{ tagName }}</h1>
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
        <p v-if="posts.length === 0" class="text-gray-500">该标签下暂无文章</p>
        <Pagination :page="page" :total="total" :page-size="pageSize" @change="onPageChange" />
      </div>
      <Sidebar />
    </div>
  </div>
</template>

<script setup lang="ts">
/** 标签文章列表页 */
const route = useRoute()
const slug = route.params.slug as string
const page = ref(1)
const pageSize = 10

const { data: tagData } = await useFetch('/api/tags')
const tag = computed(() => tagData.value?.data?.find((t: { slug: string }) => t.slug === slug))
const tagName = computed(() => tag.value?.name || slug)

usePageSeo({
  title: `标签：${tagName.value}`,
  description: `${tagName.value} 相关文章`,
})

const { data, refresh } = await useFetch('/api/posts', {
  query: computed(() => ({ page: page.value, pageSize, tag: slug })),
})

const posts = computed(() => data.value?.data?.list || [])
const total = computed(() => data.value?.data?.total || 0)

function onPageChange(p: number) {
  page.value = p
  refresh()
}
</script>
