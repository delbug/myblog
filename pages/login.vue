<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4">
    <form class="card w-full max-w-md space-y-4" @submit.prevent="submit">
      <h1 class="text-center text-2xl font-bold">登录</h1>

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

      <p class="text-center text-sm text-gray-500">
        还没有账号？
        <NuxtLink to="/register" class="text-primary-600 hover:underline">立即注册</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
/** 前台用户登录 */
definePageMeta({ layout: 'default' })

const route = useRoute()
const { login } = useAuth()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref(route.query.error as string || '')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const user = await login(form.username, form.password)
    if (user?.role === 'admin') {
      navigateTo('/admin')
    } else {
      navigateTo('/')
    }
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
