<template>
  <div v-if="tabs.length" class="mb-4 flex flex-wrap gap-1 border-b border-gray-200 pb-2 dark:border-gray-700">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="group flex items-center gap-1 rounded-t px-3 py-1.5 text-sm transition-colors"
      :class="route.path === tab.path ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'"
    >
      <NuxtLink :to="tab.path">{{ tab.title }}</NuxtLink>
      <button
        v-if="tab.path !== '/admin'"
        class="hidden text-gray-400 hover:text-red-500 group-hover:inline"
        @click.stop="closeTab(tab.path)"
      >×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/** 后台多页签导航 */
const route = useRoute()
const { tabs, closeTab } = useAdminTabs()
</script>
