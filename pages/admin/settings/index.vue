<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">站点设置</h1>

    <form class="card max-w-lg space-y-4" @submit.prevent="save">
      <div>
        <label class="mb-1 block text-sm">关于介绍</label>
        <textarea v-model="form.about" class="input min-h-[120px]" />
      </div>
      <div>
        <label class="mb-1 block text-sm">邮箱</label>
        <input v-model="form.email" class="input" type="email" />
      </div>
      <div>
        <label class="mb-1 block text-sm">GitHub 链接</label>
        <input v-model="form.github" class="input" />
      </div>

      <p v-if="message" class="text-sm text-green-600">{{ message }}</p>

      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? '保存中...' : '保存设置' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
/** 站点设置页 */
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const form = reactive({ about: '', email: '', github: '' })
const saving = ref(false)
const message = ref('')

const { data } = await useFetch('/api/settings')
if (data.value?.data) {
  Object.assign(form, data.value.data)
}

/** 保存站点配置 */
async function save() {
  saving.value = true
  message.value = ''
  try {
    await $fetch('/api/settings', { method: 'PUT', body: form })
    message.value = '设置已保存'
  } catch {
    message.value = '保存失败'
  } finally {
    saving.value = false
  }
}
</script>
