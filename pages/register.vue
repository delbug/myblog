<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4">
    <form class="card w-full max-w-md space-y-4" @submit.prevent="submit">
      <h1 class="text-center text-2xl font-bold">注册</h1>

      <div>
        <label class="mb-1 block text-sm">用户名 *</label>
        <input v-model="form.username" class="input" required minlength="3" />
      </div>
      <div>
        <label class="mb-1 block text-sm">邮箱</label>
        <input v-model="form.email" class="input" type="email" />
      </div>
      <div>
        <label class="mb-1 block text-sm">密码 *</label>
        <input v-model="form.password" class="input" type="password" required minlength="6" />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <p class="text-center text-sm text-gray-500">
        已有账号？
        <NuxtLink to="/login" class="text-primary-600 hover:underline">去登录</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
/** 用户注册 */
definePageMeta({ layout: 'default' })

const { register } = useAuth()
const form = reactive({ username: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await register(form.username, form.password, form.email || undefined)
    navigateTo('/')
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
