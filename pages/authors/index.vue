<template>
  <div>
    <SitePageHeader title="作者专栏" description="浏览各位作者的文章" />

    <SiteMainPanel flush>
      <a-row :gutter="[16, 16]">
        <a-col v-for="author in authors" :key="author.id" :xs="24" :sm="12" :lg="8">
          <NuxtLink :to="`/authors/${author.username}`">
            <a-card hoverable>
              <a-card-meta>
                <template #avatar>
                  <a-avatar size="large" style="background-color: #1677ff">
                    {{ author.username.charAt(0).toUpperCase() }}
                  </a-avatar>
                </template>
                <template #title>{{ author.username }}</template>
                <template #description>{{ author.postCount }} 篇文章</template>
              </a-card-meta>
              <a-typography-paragraph v-if="author.bio" type="secondary" :ellipsis="{ rows: 2 }" style="margin-top: 12px; margin-bottom: 0">
                {{ author.bio }}
              </a-typography-paragraph>
            </a-card>
          </NuxtLink>
        </a-col>
      </a-row>
      <a-empty v-if="!authors.length" description="暂无作者" />
    </SiteMainPanel>
  </div>
</template>

<script setup lang="ts">
usePageSeo({ title: '作者专栏', description: '博客作者列表' })

const { data } = await useFetch('/api/authors')
const authors = computed(() => data.value?.data || [])
</script>
