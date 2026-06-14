<template>
  <div class="site-auth-page">
    <a-card class="site-auth-card" :bordered="false">
      <div class="text-center mb-6">
        <a-typography-title :level="3" style="margin-bottom: 8px">注册</a-typography-title>
        <a-typography-text type="secondary">创建你的账号</a-typography-text>
      </div>

      <a-form layout="vertical" :model="form" @finish="submit">
        <a-form-item label="用户名" name="username" :rules="[{ required: true, min: 3, message: '用户名至少 3 个字符' }]">
          <a-input v-model:value="form.username" size="large" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="form.email" size="large" type="email" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, min: 6, message: '密码至少 6 个字符' }]">
          <a-input-password v-model:value="form.password" size="large" />
        </a-form-item>
        <a-alert v-if="error" type="error" :message="error" show-icon class="mb-4" />
        <a-button type="primary" html-type="submit" size="large" block :loading="loading">注册</a-button>
      </a-form>

      <div class="text-center" style="margin-top: 16px">
        <a-typography-text type="secondary">已有账号？</a-typography-text>
        <NuxtLink to="/login"><a>去登录</a></NuxtLink>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
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
