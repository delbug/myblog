<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <a-space v-if="searchable" wrap>
      <a-input-search
        v-model:value="keyword"
        :placeholder="searchPlaceholder"
        allow-clear
        style="width: 280px"
        @search="emit('search', keyword)"
      />
      <a-button v-if="exportable" @click="exportCsv">导出 CSV</a-button>
      <slot name="toolbar" />
    </a-space>

    <a-table
      :columns="antdColumns"
      :data-source="data"
      :row-key="rowKey || 'id'"
      :pagination="paginationConfig"
      size="middle"
      bordered
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === '__actions__'">
          <slot name="actions" :row="record" />
        </template>
        <template v-else-if="column.key && slots[`col-${String(column.key)}`]">
          <slot :name="`col-${String(column.key)}`" :row="record" :value="text" />
        </template>
        <template v-else-if="column.key">
          {{ formatCell(String(column.key), text, record) }}
        </template>
      </template>
      <template #emptyText>
        <a-empty description="暂无数据" />
      </template>
    </a-table>
  </a-space>
</template>

<script setup lang="ts">
import type { TableColumnType, TableProps } from 'ant-design-vue/es/table'

export interface TableColumn {
  key: string
  title: string
  width?: number
  format?: (val: unknown, row: Record<string, unknown>) => string
}

const props = withDefaults(defineProps<{
  columns: TableColumn[]
  data: Record<string, unknown>[]
  total?: number
  page?: number
  pageSize?: number
  rowKey?: string
  searchable?: boolean
  exportable?: boolean
  searchPlaceholder?: string
  exportFilename?: string
}>(), {
  total: 0,
  page: 1,
  pageSize: 10,
  searchable: true,
  exportable: false,
  searchPlaceholder: '搜索...',
  exportFilename: 'export.csv',
})

const emit = defineEmits<{ search: [keyword: string]; 'page-change': [page: number] }>()
const slots = useSlots()
const keyword = ref('')

const antdColumns = computed<TableColumnType[]>(() => {
  const cols: TableColumnType[] = props.columns.map((c) => ({
    title: c.title,
    dataIndex: c.key,
    key: c.key,
    width: c.width,
    ellipsis: c.key === 'title' || c.key === 'detail',
  }))
  if (slots.actions) {
    cols.push({ title: '操作', key: '__actions__', width: 180, fixed: 'right' })
  }
  return cols
})

const paginationConfig = computed(() => {
  if (props.total <= props.pageSize) return false
  return {
    current: props.page,
    pageSize: props.pageSize,
    total: props.total,
    showSizeChanger: false,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

function formatCell(key: string, val: unknown, row: Record<string, unknown>) {
  const col = props.columns.find((c) => c.key === key)
  if (col?.format) return col.format(val, row)
  return val ?? '-'
}

const onTableChange: TableProps['onChange'] = (pag) => {
  if (pag?.current && pag.current !== props.page) {
    emit('page-change', pag.current)
  }
}

function exportCsv() {
  const header = props.columns.map((c) => c.title).join(',')
  const rows = props.data.map((row) =>
    props.columns.map((c) => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.exportFilename
  a.click()
  URL.revokeObjectURL(url)
}
</script>
