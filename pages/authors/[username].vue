<template>
  <div class="container mx-auto px-4 py-8">
    <header v-if="author" class="mb-8 flex items-start gap-4">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/40">
        {{ author.username.charAt(0).toUpperCase() }}
      </div>
      <div>
        <h1 class="text-2xl font-bold">{{ author.username }}</h1>
        <p class="text-sm text-gray-500">{{ author.postCount }} 篇文章</p>
        <p v-if="author.bio" class="mt-2 max-w-xl text-gray-600 dark:text-gray-400">{{ author.bio }}</p>
      </div>
    </header>

    <h2 class="mb-4 text-lg font-semibold">Ta 的文章</h2>
    <div class="space-y-6">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
      <p v-if="posts.length === 0" class="text-gray-500">暂无文章</p>
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
const route = useRoute()
const username = route.params.username as string
const page = ref(1)
const pageSize = 10

const { data, refresh } = await useFetch(`/api/authors/${username}`, {
  query: computed(() => ({ page: page.value, pageSize })),
})

const author = computed(() => data.value?.data?.author)
const posts = computed(() => data.value?.data?.list || [])
const total = computed(() => data.value?.data?.total || 0)

watch(author, (a) => {
  if (a) usePageSeo({ title: `${a.username} 的主页`, description: a.bio || `${a.username} 的文章列表` })
}, { immediate: true })

function onPageChange(p: number) {
  page.value = p
  refresh()
}
</script>
