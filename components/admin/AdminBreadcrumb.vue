<template>
  <nav v-if="items.length" class="mb-4 flex items-center gap-1 text-sm text-gray-500">
    <NuxtLink to="/admin" class="hover:text-primary-600">首页</NuxtLink>
    <template v-for="(item, i) in items" :key="i">
      <span>/</span>
      <NuxtLink v-if="item.to" :to="item.to" class="hover:text-primary-600">{{ item.label }}</NuxtLink>
      <span v-else class="text-gray-800 dark:text-gray-200">{{ item.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
/** 后台面包屑导航 */
defineProps<{
  items: Array<{ label: string; to?: string }>
}>()
</script>
