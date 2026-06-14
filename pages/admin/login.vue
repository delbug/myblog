<template>
  <a-config-provider :locale="zhCN">
    <div class="admin-app admin-login-page">
      <a-card class="admin-login-card" :bordered="false">
        <div class="mb-6 text-center">
          <a-typography-title :level="3" style="margin-bottom: 8px">Blog Admin</a-typography-title>
          <a-typography-text type="secondary">管理员登录</a-typography-text>
        </div>

        <a-form layout="vertical" :model="form" @finish="login">
          <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
            <a-input v-model:value="form.username" size="large" autocomplete="username" />
          </a-form-item>
          <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
            <a-input-password v-model:value="form.password" size="large" autocomplete="current-password" />
          </a-form-item>
          <a-alert v-if="error" type="error" :message="error" show-icon class="mb-4" />
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">登录</a-button>
        </a-form>

        <a-typography-paragraph type="secondary" class="mt-4 text-center" style="margin-bottom: 8px">
          默认账号：admin / admin123
        </a-typography-paragraph>
        <div class="text-center">
          <a-typography-text type="secondary">普通用户请 </a-typography-text>
          <NuxtLink to="/login"><a>前台登录</a></NuxtLink>
        </div>
      </a-card>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'

import 'ant-design-vue/dist/reset.css'
import '~/assets/css/admin-antd.css'

definePageMeta({ layout: false })

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

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
