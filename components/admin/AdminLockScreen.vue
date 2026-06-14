<template>
  <a-modal
    v-model:open="locked"
    title="屏幕已锁定"
    :closable="false"
    :mask-closable="false"
    :footer="null"
    centered
  >
    <a-typography-paragraph type="secondary">长时间无操作，请输入密码解锁</a-typography-paragraph>
    <a-form layout="vertical" @finish="unlock">
      <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
        <a-input-password v-model:value="password" autofocus />
      </a-form-item>
      <a-alert v-if="error" type="error" :message="error" show-icon class="mb-3" />
      <a-button type="primary" html-type="submit" block>解锁</a-button>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
const locked = ref(false)
const password = ref('')
const error = ref('')
const IDLE_MS = 30 * 60 * 1000
let timer: ReturnType<typeof setTimeout>

function resetTimer() {
  clearTimeout(timer)
  timer = setTimeout(() => { locked.value = true }, IDLE_MS)
}

async function unlock() {
  error.value = ''
  try {
    const { user } = useAuth()
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: user.value?.username, password: password.value },
    })
    locked.value = false
    password.value = ''
    resetTimer()
  } catch {
    error.value = '密码错误'
  }
}

onMounted(() => {
  const events = ['mousemove', 'keydown', 'click', 'scroll']
  events.forEach((e) => window.addEventListener(e, resetTimer))
  resetTimer()
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>
