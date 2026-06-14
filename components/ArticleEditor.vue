<template>
  <div class="article-editor">
    <div class="mb-2 flex gap-2 text-sm">
      <button
        type="button"
        class="rounded px-3 py-1"
        :class="mode === 'vditor' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'"
        @click="mode = 'vditor'"
      >
        Vditor (Markdown)
      </button>
      <button
        type="button"
        class="rounded px-3 py-1"
        :class="mode === 'tiptap' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'"
        @click="mode = 'tiptap'"
      >
        TipTap (可视化)
      </button>
    </div>

    <MarkdownEditor v-if="mode === 'vditor'" :model-value="modelValue" :placeholder="placeholder" @update:model-value="emit('update:modelValue', $event)" />
    <TipTapEditor v-else :model-value="modelValue" :placeholder="placeholder" @update:model-value="emit('update:modelValue', $event)" />
  </div>
</template>

<script setup lang="ts">
/** 文章编辑器：Vditor / TipTap 双模式 */
defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const mode = ref<'vditor' | 'tiptap'>('vditor')
</script>
