export interface AdminTab {
  title: string
  path: string
}

/** 后台多页签状态 */
export function useAdminTabs() {
  const tabs = useState<AdminTab[]>('admin-tabs', () => [])
  const route = useRoute()

  /** 打开或激活页签 */
  function openTab(title: string, path?: string) {
    const p = path || route.path
    if (!tabs.value.find((t) => t.path === p)) {
      tabs.value.push({ title, path: p })
    }
  }

  /** 关闭页签 */
  function closeTab(path: string) {
    tabs.value = tabs.value.filter((t) => t.path !== path)
  }

  /** 关闭其他页签 */
  function closeOthers(path: string) {
    tabs.value = tabs.value.filter((t) => t.path === path || t.path === '/admin')
  }

  return { tabs, openTab, closeTab, closeOthers }
}
