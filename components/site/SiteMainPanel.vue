<template>
  <div class="site-main-panel" :class="{ 'site-main-panel--flush': flush }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** 列表页卡片间距由外层控制，面板内不再额外 padding */
  flush?: boolean
}>(), {
  flush: false,
})
</script>
