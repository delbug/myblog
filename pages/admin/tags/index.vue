<template>
  <div>
    <AdminPageHeader title="标签管理" :breadcrumb="[{ label: '标签管理' }]">
      <template #extra>
        <a-button type="primary" @click="showForm = !showForm">{{ showForm ? '取消' : '新建标签' }}</a-button>
      </template>
    </AdminPageHeader>

    <a-card v-if="showForm" class="mb-4">
      <a-form layout="inline" @finish="create">
        <a-form-item label="标签名称" required>
          <a-input v-model:value="newTag.name" placeholder="标签名称" style="width: 240px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">创建</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card>
      <a-space wrap>
        <a-tag v-for="tag in list" :key="tag.id" closable @close.prevent="remove(tag.id)">
          #{{ tag.name }}
        </a-tag>
        <a-empty v-if="!list.length" description="暂无标签" />
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { Modal, message } from 'ant-design-vue'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const showForm = ref(false)
const newTag = reactive({ name: '' })
const { data, refresh } = await useFetch('/api/tags')
const list = computed(() => data.value?.data || [])

async function create() {
  await $fetch('/api/tags', { method: 'POST', body: newTag })
  newTag.name = ''
  showForm.value = false
  message.success('标签已创建')
  refresh()
}

function remove(id: number) {
  Modal.confirm({
    title: '删除标签？',
    okType: 'danger',
    onOk: async () => {
      await $fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
      message.success('已删除')
      refresh()
    },
  })
}
</script>
