<template>
  <div class="image-upload">
    <div v-if="modelValue" class="relative mb-2 inline-block">
      <img :src="modelValue" alt="预览" class="max-h-40 rounded-lg border dark:border-gray-700" />
      <button type="button" class="absolute right-1 top-1 rounded bg-black/50 px-2 py-0.5 text-xs text-white" @click="clear">移除</button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <label class="btn-secondary cursor-pointer text-sm">
        {{ uploading ? '上传中...' : '上传图片' }}
        <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="onFile" />
      </label>
      <input
        :value="modelValue"
        class="input min-w-0 flex-1 text-sm"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <p class="mt-1 text-xs text-gray-400">支持本地 / 阿里云 OSS / 七牛 / Cloudinary（由 STORAGE_DRIVER 决定）</p>
  </div>
</template>

<script setup lang="ts">
/** 图片上传：封面图 / 文中插图，自动写入 URL */
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const uploading = ref(false)

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<{ data: { url: string } }>('/api/upload/image', { method: 'POST', body: formData })
    emit('update:modelValue', res.data.url)
  } catch {
    alert('上传失败，请先登录')
  } finally {
    uploading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

function clear() {
  emit('update:modelValue', '')
}
</script>
