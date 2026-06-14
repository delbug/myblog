<template>
  <div class="site-container">
    <a-card v-if="author" style="margin-bottom: 24px">
      <a-space align="start">
        <a-avatar size="large" style="background-color: #1677ff; width: 64px; height: 64px; line-height: 64px; font-size: 24px">
          {{ author.username.charAt(0).toUpperCase() }}
        </a-avatar>
        <div>
          <a-typography-title :level="2" style="margin: 0">{{ author.username }}</a-typography-title>
          <a-typography-text type="secondary">{{ author.postCount }} 篇文章</a-typography-text>
          <a-typography-paragraph v-if="author.bio" style="margin-top: 8px; max-width: 560px">
            {{ author.bio }}
          </a-typography-paragraph>
        </div>
      </a-space>
    </a-card>

    <a-typography-title :level="4">Ta 的文章</a-typography-title>

    <PostCard v-for="post in posts" :key="post.id" :post="post" />
    <a-empty v-if="posts.length === 0" description="暂无文章" />

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
