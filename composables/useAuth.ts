/**
 * 全局用户认证状态
 */
export function useAuth() {
  const user = useState<{
    id: number
    username: string
    email: string | null
    avatar: string | null
    role: 'admin' | 'user'
    bio?: string | null
  } | null>('auth-user', () => null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /** 拉取当前登录用户 */
  async function fetchUser() {
    try {
      const res = await $fetch<{ data: typeof user.value }>('/api/auth/me')
      user.value = res.data || null
    } catch {
      user.value = null
    }
    return user.value
  }

  /** 登录 */
  async function login(username: string, password: string) {
    const res = await $fetch<{ data: typeof user.value }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    user.value = res.data
    return res.data
  }

  /** 注册 */
  async function register(username: string, password: string, email?: string) {
    const res = await $fetch<{ data: typeof user.value }>('/api/auth/register', {
      method: 'POST',
      body: { username, password, email },
    })
    user.value = res.data
    return res.data
  }

  /** 退出 */
  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, isLoggedIn, isAdmin, fetchUser, login, register, logout }
}
