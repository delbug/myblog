<template>
  <aside class="space-y-6">
    <!-- 搜索框 -->
    <div class="card">
      <h3 class="mb-3 font-semibold">搜索</h3>
      <form @submit.prevent="handleSearch">
        <input v-model="keyword" type="text" class="input" placeholder="搜索文章..." />
        <button type="submit" class="btn-primary mt-2 w-full">搜索</button>
      </form>
    </div>

    <!-- 分类 -->
    <div v-if="categories?.length" class="card">
      <h3 class="mb-3 font-semibold">分类</h3>
      <ul class="space-y-2">
        <li v-for="cat in categories" :key="cat.id">
          <NuxtLink
            :to="`/categories/${cat.slug}`"
            class="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400"
          >
            {{ cat.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- 标签云 -->
    <div v-if="tags?.length" class="card">
      <h3 class="mb-3 font-semibold">标签</h3>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-primary-100 hover:text-primary-700 dark:bg-gray-700 dark:hover:bg-primary-900/30"
        >
          #{{ tag.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- 热门文章 -->
    <div v-if="hotPosts?.length" class="card">
      <h3 class="mb-3 font-semibold">热门阅读</h3>
      <ul class="space-y-2">
        <li v-for="post in hotPosts" :key="post.id">
          <NuxtLink
            :to="`/posts/${post.slug}`"
            class="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400"
          >
            {{ post.title }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * 侧边栏：搜索、分类、标签、热门文章
 */
const keyword = ref('')

const { data: categoriesData } = await useFetch('/api/categories')
const { data: tagsData } = await useFetch('/api/tags')
const { data: hotData } = await useFetch('/api/posts', { query: { page: 1, pageSize: 5, orderBy: 'popular' } })

const categories = computed(() => categoriesData.value?.data || [])
const tags = computed(() => tagsData.value?.data || [])
const hotPosts = computed(() => hotData.value?.data?.list || [])

/** 提交搜索，跳转搜索页 */
function handleSearch() {
  if (keyword.value.trim()) {
    navigateTo({ path: '/search', query: { keyword: keyword.value.trim() } })
  }
}
</script>
