<template>
  <div v-if="totalPages > 1" class="flex justify-center" style="margin-top: 24px">
    <a-pagination
      :current="page"
      :total="total"
      :page-size="pageSize"
      :show-size-changer="false"
      show-less-items
      @change="goTo"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

function goTo(p: number) {
  if (p >= 1 && p <= totalPages.value) {
    emit('change', p)
  }
}
</script>
