<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <h1 class="mb-8 text-3xl font-bold">关于我</h1>

    <div class="card prose-blog">
      <p>{{ settings.about || '暂无介绍' }}</p>

      <div v-if="settings.email || settings.github" class="mt-6 space-y-2 not-prose">
        <p v-if="settings.email">
          📧 <a :href="`mailto:${settings.email}`" class="text-primary-600 hover:underline">{{ settings.email }}</a>
        </p>
        <p v-if="settings.github">
          🔗 <a :href="settings.github" class="text-primary-600 hover:underline" target="_blank">GitHub</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 关于页 */
const { data } = await useFetch('/api/settings')
const settings = computed(() => data.value?.data || {})

usePageSeo({
  title: '关于',
  description: (settings.value.about as string) || '关于本站',
})
</script>
