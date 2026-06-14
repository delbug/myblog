<template>
  <aside>
    <a-card title="搜索" size="small" class="site-sidebar-card">
      <a-input-search
        v-model:value="keyword"
        placeholder="搜索文章..."
        enter-button="搜索"
        @search="handleSearch"
      />
    </a-card>

    <a-card v-if="categories?.length" title="分类" size="small" class="site-sidebar-card">
      <a-list size="small" :data-source="categories">
        <template #renderItem="{ item }">
          <a-list-item>
            <NuxtLink :to="`/categories/${item.slug}`">
              <a-typography-link>{{ item.name }}</a-typography-link>
            </NuxtLink>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <a-card v-if="tags?.length" title="标签" size="small" class="site-sidebar-card">
      <a-space wrap>
        <NuxtLink v-for="tag in tags" :key="tag.id" :to="`/tags/${tag.slug}`">
          <a-tag>{{ tag.name }}</a-tag>
        </NuxtLink>
      </a-space>
    </a-card>

    <a-card v-if="hotPosts?.length" title="热门阅读" size="small" class="site-sidebar-card">
      <a-list size="small" :data-source="hotPosts">
        <template #renderItem="{ item }">
          <a-list-item>
            <NuxtLink :to="`/posts/${item.slug}`">
              <a-typography-link>{{ item.title }}</a-typography-link>
            </NuxtLink>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </aside>
</template>

<script setup lang="ts">
const keyword = ref('')

const { data: categoriesData } = await useFetch('/api/categories')
const { data: tagsData } = await useFetch('/api/tags')
const { data: hotData } = await useFetch('/api/posts', { query: { page: 1, pageSize: 5, orderBy: 'popular' } })

const categories = computed(() => categoriesData.value?.data || [])
const tags = computed(() => tagsData.value?.data || [])
const hotPosts = computed(() => hotData.value?.data?.list || [])

function handleSearch(value: string) {
  const q = value.trim()
  if (q) navigateTo({ path: '/search', query: { keyword: q } })
}
</script>
