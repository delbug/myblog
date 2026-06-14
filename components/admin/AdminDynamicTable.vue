<template>
  <div class="space-y-4">
    <!-- 搜索栏 -->
    <div v-if="searchable" class="flex flex-wrap gap-2">
      <input
        v-model="keyword"
        class="input max-w-xs"
        :placeholder="searchPlaceholder"
        @keyup.enter="emit('search', keyword)"
      />
      <button class="btn-primary" @click="emit('search', keyword)">搜索</button>
      <button v-if="exportable" class="btn-secondary" @click="exportCsv">导出 CSV</button>
      <slot name="toolbar" />
    </div>

    <!-- 表格 -->
    <div class="card overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b dark:border-gray-700">
            <th v-for="col in columns" :key="col.key" class="p-3 whitespace-nowrap">{{ col.title }}</th>
            <th v-if="$slots.actions" class="p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in data" :key="rowKey ? row[rowKey] : idx" class="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td v-for="col in columns" :key="col.key" class="p-3">
              <slot :name="`col-${col.key}`" :row="row" :value="row[col.key]">
                {{ col.format ? col.format(row[col.key], row) : row[col.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="p-3">
              <slot name="actions" :row="row" />
            </td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="p-8 text-center text-gray-400">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination v-if="total > pageSize" :page="page" :total="total" :page-size="pageSize" @change="emit('page-change', $event)" />
  </div>
</template>

<script setup lang="ts">
/** 动态表格：搜索 + 分页 + CSV 导出 */
export interface TableColumn {
  key: string
  title: string
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
const keyword = ref('')

/** 导出 CSV */
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
