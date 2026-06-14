<template>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <AdminBreadcrumb v-if="breadcrumb?.length" :items="breadcrumb" />
      <a-typography-title :level="4" style="margin: 0">{{ title }}</a-typography-title>
      <a-typography-text v-if="subtitle" type="secondary">{{ subtitle }}</a-typography-text>
    </div>
    <a-space v-if="$slots.extra">
      <slot name="extra" />
    </a-space>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  breadcrumb?: Array<{ label: string; to?: string }>
}>()
</script>
