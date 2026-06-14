<template>
  <ClientOnly>
    <div ref="editorRef" class="vditor-editor" />
    <template #fallback>
      <textarea
        :value="modelValue"
        class="input min-h-[480px] w-full font-mono text-sm"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * Vditor Markdown 编辑器：分屏预览、工具栏、图片上传
 */
const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorRef = ref<HTMLElement>()
const colorMode = useColorMode()
let vditor: import('vditor').default | null = null

onMounted(async () => {
  if (!editorRef.value) return

  const Vditor = (await import('vditor')).default
  await import('vditor/dist/index.css')

  vditor = new Vditor(editorRef.value, {
    height: 480,
    mode: 'sv',
    placeholder: props.placeholder || '开始写作...',
    theme: colorMode.value === 'dark' ? 'dark' : 'classic',
    value: props.modelValue,
    input: (value) => emit('update:modelValue', value),
    upload: {
      url: '/api/upload/image',
      fieldName: 'file',
      accept: 'image/*',
      format(_files, responseText) {
        try {
          const resp = JSON.parse(responseText)
          const url = resp.data?.url
          if (!url) return ''
          return JSON.stringify({
            msg: '',
            code: 0,
            data: { errFiles: [], succMap: { image: url } },
          })
        } catch {
          return ''
        }
      },
    },
    cache: { enable: false },
    preview: {
      theme: { current: colorMode.value === 'dark' ? 'dark' : 'light' },
    },
  })
})

watch(() => props.modelValue, (val) => {
  if (vditor && vditor.getValue() !== val) vditor.setValue(val, true)
})

watch(() => colorMode.value, (mode) => {
  vditor?.setTheme(mode === 'dark' ? 'dark' : 'classic')
})

onBeforeUnmount(() => {
  vditor?.destroy()
  vditor = null
})
</script>

<style scoped>
.vditor-editor :deep(.vditor) {
  border-radius: 0.5rem;
  border-color: rgb(229 231 235);
}

:global(.dark) .vditor-editor :deep(.vditor) {
  border-color: rgb(55 65 81);
}
</style>
