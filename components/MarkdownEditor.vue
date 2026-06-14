<template>
  <div class="markdown-editor">
    <!-- 工具栏 -->
    <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
      <button type="button" class="toolbar-btn" title="粗体" @click="insert('**', '**')">B</button>
      <button type="button" class="toolbar-btn" title="斜体" @click="insert('*', '*')">I</button>
      <button type="button" class="toolbar-btn" title="标题" @click="insert('## ', '')">H</button>
      <button type="button" class="toolbar-btn" title="链接" @click="insert('[', '](url)')">🔗</button>
      <button type="button" class="toolbar-btn" title="代码块" @click="insert('```javascript\n', '\n```')">{ }</button>
      <button type="button" class="toolbar-btn" title="引用" @click="insert('> ', '')">❝</button>
      <button type="button" class="toolbar-btn" title="列表" @click="insert('- ', '')">•</button>
      <div class="ml-auto flex gap-2">
        <button
          type="button"
          class="text-xs px-2 py-1 rounded"
          :class="mode === 'edit' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'"
          @click="mode = 'edit'"
        >
          编辑
        </button>
        <button
          type="button"
          class="text-xs px-2 py-1 rounded"
          :class="mode === 'preview' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'"
          @click="mode = 'preview'"
        >
          预览
        </button>
        <button
          type="button"
          class="text-xs px-2 py-1 rounded"
          :class="mode === 'split' ? 'bg-primary-100 text-primary-700' : 'text-gray-500'"
          @click="mode = 'split'"
        >
          分屏
        </button>
        <label class="toolbar-btn cursor-pointer">
          📷
          <input type="file" accept="image/*" class="hidden" @change="uploadImage" />
        </label>
      </div>
    </div>

    <div class="grid" :class="gridClass">
      <!-- 编辑区 -->
      <div v-show="mode !== 'preview'" class="relative">
        <textarea
          ref="textareaRef"
          :value="modelValue"
          class="min-h-[480px] w-full resize-y border-0 bg-white p-4 font-mono text-sm focus:outline-none dark:bg-gray-900"
          :placeholder="placeholder"
          @input="onInput"
        />
      </div>

      <!-- 预览区 -->
      <div
        v-show="mode !== 'edit'"
        class="prose-blog min-h-[480px] overflow-auto border-l border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        v-html="previewHtml"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Markdown 编辑器：支持工具栏、实时预览、分屏、图片上传
 */
const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const mode = ref<'edit' | 'preview' | 'split'>('split')
const textareaRef = ref<HTMLTextAreaElement>()
const { render } = useMarkdownPreview()

/** 实时预览 HTML */
const previewHtml = computed(() => render(props.modelValue || '*预览区域*'))

/** 分屏布局 class */
const gridClass = computed(() => {
  if (mode.value === 'split') return 'md:grid-cols-2'
  return 'grid-cols-1'
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

/** 在光标处插入 Markdown 语法 */
function insert(before: string, after: string) {
  const el = textareaRef.value
  if (!el) return

  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = props.modelValue.slice(start, end)
  const newValue = props.modelValue.slice(0, start) + before + selected + after + props.modelValue.slice(end)

  emit('update:modelValue', newValue)

  nextTick(() => {
    el.focus()
    const pos = start + before.length + selected.length
    el.setSelectionRange(pos, pos)
  })
}

/** 上传图片并插入 Markdown 语法 */
async function uploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<{ data: { url: string } }>('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    insert(`![${file.name}](${res.data.url})`, '')
  } catch {
    alert('图片上传失败，请先登录')
  }
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<style scoped>
.toolbar-btn {
  @apply rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700;
}
</style>

<style>
@import 'highlight.js/styles/github-dark.css';
</style>
