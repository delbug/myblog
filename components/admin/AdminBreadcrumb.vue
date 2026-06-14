<template>
  <a-breadcrumb v-if="items.length" class="mb-3">
    <a-breadcrumb-item>
      <NuxtLink to="/admin">首页</NuxtLink>
    </a-breadcrumb-item>
    <a-breadcrumb-item v-for="(item, i) in items" :key="i">
      <NuxtLink v-if="item.to" :to="item.to">{{ item.label }}</NuxtLink>
      <span v-else>{{ item.label }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; to?: string }>
}>()
</script>
