<template>
  <div class="site-container" style="max-width: 720px">
    <a-typography-title :level="2">我的收藏</a-typography-title>

    <a-card v-if="!isLoggedIn" style="margin-top: 24px">
      <a-empty description="请先登录">
        <NuxtLink to="/login">
          <a-button type="primary">去登录</a-button>
        </NuxtLink>
      </a-empty>
    </a-card>

    <template v-else>
      <a-list v-if="list.length" item-layout="vertical" :data-source="list" style="margin-top: 24px">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <NuxtLink :to="`/posts/${item.slug}`">{{ item.title }}</NuxtLink>
              </template>
              <template #description>{{ item.summary }}</template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
      <a-empty v-else description="暂无收藏" style="margin-top: 48px" />
    </template>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, fetchUser } = useAuth()
await fetchUser()

const { data } = await useFetch('/api/user/favorites')
const list = computed(() => data.value?.data?.list || [])
</script>
