<template>
  <a-row :gutter="24">
      <a-col :xs="24" :lg="16">
        <SitePageHeader :title="`标签：${tagName}`" />

        <SiteMainPanel flush>
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
          <a-empty v-if="posts.length === 0" description="该标签下暂无文章" />
        </SiteMainPanel>

        <Pagination :page="page" :total="total" :page-size="pageSize" @change="onPageChange" />
      </a-col>
      <a-col :xs="24" :lg="8">
        <Sidebar />
      </a-col>
    </a-row>
</template>

<script setup lang="ts">
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
