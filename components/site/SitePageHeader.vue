<template>
  <div class="site-page-header">
    <div class="site-page-header__main">
      <a-typography-title :level="level" class="site-page-header__title">
        {{ title }}
      </a-typography-title>
      <a-typography-text v-if="description" type="secondary" class="site-page-header__desc">
        {{ description }}
      </a-typography-text>
    </div>
    <div v-if="$slots.extra" class="site-page-header__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  level?: 1 | 2 | 3 | 4 | 5
}>(), {
  level: 2,
})
</script>
