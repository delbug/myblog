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
      :key="editorKey"
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <TipTapEditor
      v-else
      :key="editorKey"
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
/** 文章编辑器：Vditor / TipTap 双模式 */
defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const mode = ref<'vditor' | 'tiptap'>('vditor')
const editorKey = ref(0)

watch(mode, () => {
  editorKey.value += 1
})
</script>
