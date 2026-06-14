<template>
  <div>
    <SitePageHeader title="文章归档" description="按年月浏览全部文章" />

    <SiteMainPanel v-if="archive && Object.keys(archive).length">
      <a-collapse v-model:active-key="activeKeys">
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
    </SiteMainPanel>

    <SiteMainPanel v-else>
      <a-empty description="暂无归档" />
    </SiteMainPanel>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

usePageSeo({ title: '归档', description: '按时间浏览所有文章' })

const { data } = await useFetch('/api/archive')
const archive = computed(() => data.value?.data || {})
const activeKeys = ref<string[]>([])
</script>
