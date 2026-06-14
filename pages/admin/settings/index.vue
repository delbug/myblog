<template>
  <div>
    <AdminPageHeader title="站点设置" :breadcrumb="[{ label: '站点设置' }]" />

    <a-row :gutter="16">
      <a-col :xs="24" :lg="14">
        <a-card title="基本信息">
          <a-form layout="vertical" @finish="save">
            <a-form-item label="关于介绍">
              <a-textarea v-model:value="form.about" :rows="5" />
            </a-form-item>
            <a-form-item label="邮箱">
              <a-input v-model:value="form.email" type="email" />
            </a-form-item>
            <a-form-item label="GitHub 链接">
              <a-input v-model:value="form.github" />
            </a-form-item>
            <a-form-item label="Google Analytics ID">
              <a-input v-model:value="form.gaId" placeholder="G-XXXXXXXXXX" />
            </a-form-item>
            <a-form-item label="百度统计 ID">
              <a-input v-model:value="form.baiduTongjiId" placeholder="hm.js 中的站点 ID" />
            </a-form-item>
            <a-button type="primary" html-type="submit" :loading="saving">保存设置</a-button>
          </a-form>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card title="搜索索引">
          <a-typography-paragraph type="secondary">
            配置 Meilisearch 后，可手动重建全文搜索索引。
          </a-typography-paragraph>
          <a-button :loading="reindexing" @click="reindexSearch">重建 Meilisearch 索引</a-button>
          <a-alert v-if="reindexMsg" class="mt-4" type="success" :message="reindexMsg" show-icon />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const form = reactive({ about: '', email: '', github: '', gaId: '', baiduTongjiId: '' })
const saving = ref(false)
const reindexing = ref(false)
const reindexMsg = ref('')

const { data } = await useFetch('/api/settings')
if (data.value?.data) {
  Object.assign(form, data.value.data)
}

async function save() {
  saving.value = true
  try {
    await $fetch('/api/settings', { method: 'PUT', body: form })
    message.success('设置已保存')
  } catch {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function reindexSearch() {
  reindexing.value = true
  reindexMsg.value = ''
  try {
    const res = await $fetch<{ data: { indexed: number } }>('/api/admin/search/reindex', { method: 'POST' })
    reindexMsg.value = `索引重建完成，共 ${res.data.indexed} 篇文章`
    message.success('索引重建完成')
  } catch (e: unknown) {
    message.error((e as { data?: { message?: string } })?.data?.message || '重建失败（请确认 Meilisearch 已启动）')
  } finally {
    reindexing.value = false
  }
}
</script>
