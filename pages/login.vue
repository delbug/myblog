<template>
  <div class="site-auth-page">
    <a-card class="site-auth-card">
      <div style="text-align: center; margin-bottom: 24px">
        <a-typography-title :level="3" style="margin-bottom: 8px">登录</a-typography-title>
        <a-typography-text type="secondary">欢迎回来</a-typography-text>
      </div>

      <a-form layout="vertical" :model="form" @finish="submit">
        <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="form.username" size="large" autocomplete="username" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" size="large" autocomplete="current-password" />
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon style="margin-bottom: 16px" />
        <a-button type="primary" html-type="submit" size="large" block :loading="loading">登录</a-button>
      </a-form>

      <div style="text-align: center; margin-top: 16px">
        <a-typography-text type="secondary">还没有账号？</a-typography-text>
        <NuxtLink to="/register"><a>立即注册</a></NuxtLink>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
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
