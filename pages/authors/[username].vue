<template>
  <div>
    <SitePageHeader v-if="author" :title="author.username" :description="author.bio || `${author.postCount} 篇文章`" />

    <SiteMainPanel flush>
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
      <a-empty v-if="posts.length === 0" description="暂无文章" />
    </SiteMainPanel>

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
