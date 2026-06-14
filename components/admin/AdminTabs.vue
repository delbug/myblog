<template>
  <a-tabs
    v-if="tabs.length"
    type="editable-card"
    hide-add
    class="admin-tabs"
    :active-key="route.path"
    @edit="onEdit"
    @change="onChange"
  >
    <a-tab-pane v-for="tab in tabs" :key="tab.path" :tab="tab.title" :closable="tab.path !== '/admin'" />
  </a-tabs>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { tabs, closeTab } = useAdminTabs()

function onChange(key: string | number) {
  router.push(String(key))
}

function onEdit(targetKey: string | MouseEvent | KeyboardEvent, action: 'add' | 'remove') {
  if (action === 'remove' && typeof targetKey === 'string') {
    closeTab(targetKey)
  }
}
</script>

<style scoped>
.admin-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}
</style>
