<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2">
    <button
      class="btn-secondary px-3 py-1.5"
      :disabled="page <= 1"
      @click="goTo(page - 1)"
    >
      上一页
    </button>

    <span class="text-sm text-gray-600 dark:text-gray-400">
      {{ page }} / {{ totalPages }}
    </span>

    <button
      class="btn-secondary px-3 py-1.5"
      :disabled="page >= totalPages"
      @click="goTo(page + 1)"
    >
      下一页
    </button>
  </nav>
</template>

<script setup lang="ts">
/**
 * 分页组件
 */
const props = defineProps<{
  page: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

/** 跳转到指定页 */
function goTo(p: number) {
  if (p >= 1 && p <= totalPages.value) {
    emit('change', p)
  }
}
</script>
