<template>
  <div class="article-editor">
    <a-segmented
      v-model:value="mode"
      class="mb-3"
      :options="[
        { label: 'Vditor (Markdown)', value: 'vditor' },
        { label: 'TipTap (可视化)', value: 'tiptap' },
      ]"
    />

    <MarkdownEditor
      v-if="mode === 'vditor'"
      :key="'vditor-' + editorKey"
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <TipTapEditor
      v-else
      :key="'tiptap-' + editorKey"
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
/** 文章编辑器：Vditor / TipTap 双模式 */
const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const mode = ref<'vditor' | 'tiptap'>('vditor')
const editorKey = ref(0)

watch(mode, async () => {
  // 等待旧编辑器 onBeforeUnmount 完成（同步内容 / 安全销毁）后再挂载新实例
  await nextTick()
  editorKey.value += 1
})
</script>

<style scoped>
.article-editor :deep(.ant-segmented) {
  position: relative;
  z-index: 2;
}
</style>
