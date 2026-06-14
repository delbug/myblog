<template>
  <div>
    <SitePageHeader title="关于我" />

    <SiteMainPanel>
      <a-typography-paragraph>{{ settings.about || '暂无介绍' }}</a-typography-paragraph>

      <a-descriptions v-if="settings.email || settings.github" :column="1" bordered size="small" style="margin-top: 16px">
        <a-descriptions-item v-if="settings.email" label="邮箱">
          <a :href="`mailto:${settings.email}`">{{ settings.email }}</a>
        </a-descriptions-item>
        <a-descriptions-item v-if="settings.github" label="GitHub">
          <a :href="settings.github" target="_blank">GitHub</a>
        </a-descriptions-item>
      </a-descriptions>
    </SiteMainPanel>
  </div>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/settings')
const settings = computed(() => data.value?.data || {})

usePageSeo({
  title: '关于',
  description: (settings.value.about as string) || '关于本站',
})
</script>
