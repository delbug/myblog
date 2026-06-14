<template>
  <ClientOnly>
    <div class="tiptap-editor rounded-lg border dark:border-gray-700">
      <div v-if="editor" class="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800/50">
        <button type="button" class="toolbar-btn" :class="{ active: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()">B</button>
        <button type="button" class="toolbar-btn" :class="{ active: editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()">I</button>
        <button type="button" class="toolbar-btn" :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H</button>
        <button type="button" class="toolbar-btn" @click="editor.chain().focus().toggleBulletList().run()">•</button>
        <button type="button" class="toolbar-btn" @click="editor.chain().focus().toggleCodeBlock().run()">{ }</button>
        <button type="button" class="toolbar-btn" @click="insertImage">📷</button>
      </div>
      <EditorContent :editor="editor" class="prose-blog min-h-[480px] p-4" />
    </div>
    <template #fallback>
      <textarea :value="modelValue" class="input min-h-[480px] w-full font-mono text-sm" readonly />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TurndownService from 'turndown'

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { render } = useMarkdownPreview()
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })

const editor = useEditor({
  content: props.modelValue ? render(props.modelValue) : '<p></p>',
  extensions: [
    StarterKit,
    Image.configure({ inline: true }),
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder || '开始写作...' }),
  ],
  onUpdate: ({ editor: ed }) => {
    const html = ed.getHTML()
    const md = turndown.turndown(html)
    emit('update:modelValue', md)
  },
})

watch(() => props.modelValue, (val) => {
  if (!editor.value) return
  const html = val ? render(val) : '<p></p>'
  if (editor.value.getHTML() !== html) {
    editor.value.commands.setContent(html, false)
  }
})

async function insertImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file || !editor.value) return
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await $fetch<{ data: { url: string } }>('/api/upload/image', { method: 'POST', body: formData })
      editor.value.chain().focus().setImage({ src: res.data.url }).run()
    } catch {
      alert('图片上传失败')
    }
  }
  input.click()
}

onBeforeUnmount(() => editor.value?.destroy())
</script>

<style scoped>
.toolbar-btn {
  @apply rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700;
}
.toolbar-btn.active {
  @apply bg-primary-100 text-primary-700;
}
.tiptap-editor :deep(.ProseMirror) {
  outline: none;
  min-height: 480px;
}
.tiptap-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
