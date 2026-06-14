/** 权限码状态，供 v-auth 指令使用 */
export function usePermission() {
  const codes = useState<string[]>('perm-codes', () => [])

  async function fetchPermissions() {
    const { data } = await useFetch('/api/auth/permissions')
    codes.value = data.value?.data || []
    return codes.value
  }

  function has(code: string) {
    return codes.value.includes(code)
  }

  return { codes, fetchPermissions, has }
}
