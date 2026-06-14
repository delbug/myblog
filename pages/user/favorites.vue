<template>
  <div>
    <SitePageHeader title="我的收藏" />

    <SiteMainPanel v-if="!isLoggedIn">
      <a-empty description="请先登录">
        <NuxtLink to="/login">
          <a-button type="primary">去登录</a-button>
        </NuxtLink>
      </a-empty>
    </SiteMainPanel>

    <SiteMainPanel v-else flush>
      <a-card v-for="item in list" :key="item.id" size="small" class="site-search-result" hoverable>
        <NuxtLink :to="`/posts/${item.slug}`">
          <a-typography-title :level="5" style="margin: 0">{{ item.title }}</a-typography-title>
        </NuxtLink>
        <a-typography-paragraph v-if="item.summary" type="secondary" :ellipsis="{ rows: 2 }" style="margin-top: 8px; margin-bottom: 0">
          {{ item.summary }}
        </a-typography-paragraph>
      </a-card>
      <a-empty v-if="list.length === 0" description="暂无收藏" />
    </SiteMainPanel>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, fetchUser } = useAuth()
await fetchUser()

const { data } = await useFetch('/api/user/favorites')
const list = computed(() => data.value?.data?.list || [])
</script>
