<template>
  <div>
    <AdminPageHeader title="API 文档" :breadcrumb="[{ label: 'API 文档' }]" subtitle="基于 OpenAPI 3.0，Scalar 交互式文档" />

    <ClientOnly>
      <div ref="scalarRef" class="scalar-wrap min-h-[70vh] overflow-hidden rounded-lg border border-gray-200" />
      <template #fallback>
        <a-skeleton active :paragraph="{ rows: 8 }" />
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
