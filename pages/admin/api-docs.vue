<template>
  <div>
    <AdminBreadcrumb :items="[{ label: 'API 文档' }]" />
    <h1 class="mb-4 text-2xl font-bold">API 文档</h1>
    <p class="mb-4 text-sm text-gray-500">基于 OpenAPI 3.0，由 Scalar 渲染交互式文档。</p>
    <ClientOnly>
      <div ref="scalarRef" class="scalar-wrap min-h-[70vh] overflow-hidden rounded-lg border dark:border-gray-700" />
      <template #fallback>
        <p class="text-gray-500">加载 API 文档...</p>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const scalarRef = ref<HTMLElement>()

onMounted(async () => {
  if (!scalarRef.value) return
  const { createApiReference } = await import('@scalar/api-reference')
  createApiReference(scalarRef.value, {
    url: '/openapi.json',
    theme: 'purple',
    layout: 'modern',
    hideDownloadButton: false,
  })
})
</script>

<style scoped>
.scalar-wrap :deep(.scalar-app) {
  min-height: 70vh;
}
</style>
