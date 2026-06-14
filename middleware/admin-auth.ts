/**
 * 管理后台路由守卫：要求 admin 角色
 */
export default defineNuxtRouteMiddleware(async () => {
  const { data } = await useFetch('/api/auth/me')
  const user = data.value?.data

  if (!user) {
    return navigateTo('/admin/login')
  }

  if (user.role !== 'admin') {
    return navigateTo('/login?error=需要管理员权限')
  }
})
