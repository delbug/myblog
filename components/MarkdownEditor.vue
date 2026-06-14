<template>
  <ClientOnly>
    <div v-if="initError" class="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600">
      Markdown 编辑器加载失败：{{ initError }}
      <a-button type="link" size="small" @click="retryInit">重试</a-button>
    </div>
    <div v-show="!initError" ref="editorRef" class="vditor-editor" />
    <template #fallback>
      <a-textarea
        :value="modelValue"
        :rows="18"
        :placeholder="placeholder"
        @update:value="emit('update:modelValue', $event)"
      />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import 'vditor/dist/index.css'

/**
 * Vditor Markdown 编辑器：分屏预览、工具栏、图片上传
 * 使用 /vditor 本地静态资源（见 nuxt.config nitro.publicAssets），避免 CDN 不可用
 */
const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorRef = ref<HTMLElement>()
const initError = ref('')
const colorMode = useColorMode()
let vditor: import('vditor').default | null = null
let initSeq = 0

async function initVditor() {
  initSeq += 1
  const seq = initSeq
  initError.value = ''

  await nextTick()
  if (!editorRef.value || seq !== initSeq) return

  try {
    vditor?.destroy()
    vditor = null

    const Vditor = (await import('vditor')).default

    vditor = new Vditor(editorRef.value, {
      height: 480,
      mode: 'sv',
      cdn: '/vditor',
      placeholder: props.placeholder || '开始写作...',
      theme: colorMode.value === 'dark' ? 'dark' : 'classic',
      value: props.modelValue,
      input: (value) => emit('update:modelValue', value),
      upload: {
        url: '/api/upload/image',
        fieldName: 'file',
        accept: 'image/*',
        withCredentials: true,
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
      after: () => {
        if (seq !== initSeq || !vditor) return
        if (props.modelValue && vditor.getValue() !== props.modelValue) {
          vditor.setValue(props.modelValue, true)
        }
      },
    })
  } catch (e) {
    initError.value = e instanceof Error ? e.message : '未知错误'
  }
}

function retryInit() {
  initVditor()
}

onMounted(() => {
  initVditor()
})

watch(() => props.modelValue, (val) => {
  if (vditor && vditor.getValue() !== val) {
    vditor.setValue(val, true)
  }
})

watch(() => colorMode.value, (mode) => {
  vditor?.setTheme(mode === 'dark' ? 'dark' : 'classic')
})

onBeforeUnmount(() => {
  initSeq += 1
  vditor?.destroy()
  vditor = null
})
</script>

<style scoped>
.vditor-editor {
  min-height: 480px;
}

.vditor-editor :deep(.vditor) {
  border-radius: 8px;
  border: 1px solid #d9d9d9;
}

:global(.dark) .vditor-editor :deep(.vditor) {
  border-color: #424242;
}
</style>
