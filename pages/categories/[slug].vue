<template>
  <a-row :gutter="24">
      <a-col :xs="24" :lg="16">
        <SitePageHeader :title="`分类：${categoryName}`" />

        <SiteMainPanel flush>
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
          <a-empty v-if="posts.length === 0" description="该分类下暂无文章" />
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

const { data: catData } = await useFetch('/api/categories')
const category = computed(() => catData.value?.data?.find((c: { slug: string }) => c.slug === slug))
const categoryName = computed(() => category.value?.name || slug)

usePageSeo({
  title: `分类：${categoryName.value}`,
  description: category.value?.description || `${categoryName.value} 相关文章`,
})

const { data, refresh } = await useFetch('/api/posts', {
  query: computed(() => ({ page: page.value, pageSize, category: slug })),
})

const posts = computed(() => data.value?.data?.list || [])
const total = computed(() => data.value?.data?.total || 0)

function onPageChange(p: number) {
  page.value = p
  refresh()
}
</script>
