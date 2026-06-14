<template>
  <a-row :gutter="24">
      <a-col :xs="24" :lg="16">
        <SitePageHeader title="最新文章">
          <template #extra>
            <a-segmented v-model:value="orderBy" :options="orderOptions" @change="onOrderChange" />
          </template>
        </SitePageHeader>

        <SiteMainPanel flush>
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
          <a-empty v-if="posts.length === 0" description="暂无文章" />
        </SiteMainPanel>

        <Pagination
          :page="page"
          :total="total"
          :page-size="pageSize"
          @change="onPageChange"
        />
      </a-col>

      <a-col :xs="24" :lg="8">
        <Sidebar />
      </a-col>
    </a-row>
</template>

<script setup lang="ts">
const page = ref(1)
const pageSize = 10
const orderBy = ref<'latest' | 'popular'>('latest')

const orderOptions = [
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'popular' },
]

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

function onOrderChange() {
  page.value = 1
  refresh()
}

function onPageChange(p: number) {
  page.value = p
  refresh()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
