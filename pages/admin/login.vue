<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <form class="card w-full max-w-md space-y-4" @submit.prevent="login">
      <h1 class="text-center text-2xl font-bold">管理员登录</h1>

      <div>
        <label class="mb-1 block text-sm">用户名</label>
        <input v-model="form.username" class="input" required autocomplete="username" />
      </div>

      <div>
        <label class="mb-1 block text-sm">密码</label>
        <input v-model="form.password" class="input" type="password" required autocomplete="current-password" />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <p class="text-center text-xs text-gray-400">默认账号：admin / admin123</p>
      <p class="text-center text-sm text-gray-500">
        普通用户请 <NuxtLink to="/login" class="text-primary-600 hover:underline">前台登录</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

/** 提交登录，校验管理员角色 */
async function login() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<{ data: { role: string } }>('/api/auth/login', { method: 'POST', body: form })
    if (res.data.role !== 'admin') {
      await $fetch('/api/auth/logout', { method: 'POST' })
      error.value = '该账号不是管理员，请使用管理员账号登录'
      return
    }
    // 同步更新客户端 auth 状态，避免跳转后 middleware 读不到用户
    const { fetchUser } = useAuth()
    await fetchUser()
    await navigateTo('/admin')
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
