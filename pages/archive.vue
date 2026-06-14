<template>
  <div class="site-container" style="max-width: 720px">
    <a-typography-title :level="2">文章归档</a-typography-title>

    <template v-if="archive && Object.keys(archive).length">
      <a-collapse v-model:active-key="activeKeys" ghost style="margin-top: 24px">
        <a-collapse-panel v-for="(items, month) in archive" :key="month" :header="month">
          <a-list size="small" :data-source="items">
            <template #renderItem="{ item }">
              <a-list-item>
                <NuxtLink :to="`/posts/${item.slug}`">
                  <a-typography-link>{{ item.title }}</a-typography-link>
                </NuxtLink>
                <template #actions>
                  <a-typography-text type="secondary">{{ formatDate(item.publishedAt) }}</a-typography-text>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-collapse-panel>
      </a-collapse>
    </template>

    <a-empty v-else description="暂无归档" style="margin-top: 48px" />
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

usePageSeo({ title: '归档', description: '按时间浏览所有文章' })

const { data } = await useFetch('/api/archive')
const archive = computed(() => data.value?.data || {})
const activeKeys = ref<string[]>([])
</script>
