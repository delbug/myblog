/** 后台动态菜单 */
export function useAdminMenu() {
  const menus = useState<Array<{
    id: number
    label: string
    path: string
    icon: string | null
  }>>('admin-menus', () => [])

  async function fetchMenus() {
    const { data } = await useFetch('/api/admin/menus')
    menus.value = data.value?.data || []
    return menus.value
  }

  return { menus, fetchMenus }
}
