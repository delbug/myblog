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
      <div>
        <label class="mb-1 block text-sm">Google Analytics ID</label>
        <input v-model="form.gaId" class="input" placeholder="G-XXXXXXXXXX" />
      </div>
      <div>
        <label class="mb-1 block text-sm">百度统计 ID</label>
        <input v-model="form.baiduTongjiId" class="input" placeholder="hm.js 中的站点 ID" />
      </div>

      <p v-if="message" class="text-sm text-green-600">{{ message }}</p>

      <button type="submit" class="btn-primary" :disabled="saving">
        {{ saving ? '保存中...' : '保存设置' }}
      </button>
    </form>

    <section class="card mt-8 max-w-lg">
      <h2 class="mb-2 text-lg font-semibold">搜索索引</h2>
      <p class="mb-4 text-sm text-gray-500">配置 Meilisearch 后，可手动重建全文搜索索引。</p>
      <button type="button" class="btn-secondary" :disabled="reindexing" @click="reindexSearch">
        {{ reindexing ? '重建中...' : '重建 Meilisearch 索引' }}
      </button>
      <p v-if="reindexMsg" class="mt-2 text-sm text-green-600">{{ reindexMsg }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
/** 站点设置页 */
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const form = reactive({ about: '', email: '', github: '', gaId: '', baiduTongjiId: '' })
const saving = ref(false)
const message = ref('')
const reindexing = ref(false)
const reindexMsg = ref('')

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

async function reindexSearch() {
  reindexing.value = true
  reindexMsg.value = ''
  try {
    const res = await $fetch<{ data: { indexed: number }; message?: string }>('/api/admin/search/reindex', { method: 'POST' })
    reindexMsg.value = `索引重建完成，共 ${res.data.indexed} 篇文章`
  } catch (e: unknown) {
    reindexMsg.value = (e as { data?: { message?: string } })?.data?.message || '重建失败（请确认 Meilisearch 已启动）'
  } finally {
    reindexing.value = false
  }
}
</script>
