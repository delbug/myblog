<template>
  <div v-if="locked" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90">
    <form class="card w-full max-w-sm space-y-4" @submit.prevent="unlock">
      <h2 class="text-center text-xl font-bold">🔒 屏幕已锁定</h2>
      <p class="text-center text-sm text-gray-500">输入密码解锁</p>
      <input v-model="password" class="input" type="password" autofocus />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button type="submit" class="btn-primary w-full">解锁</button>
    </form>
  </div>
</template>

<script setup lang="ts">
/** 后台锁屏：30 分钟无操作自动锁定 */
const locked = ref(false)
const password = ref('')
const error = ref('')
const IDLE_MS = 30 * 60 * 1000
let timer: ReturnType<typeof setTimeout>

function resetTimer() {
  clearTimeout(timer)
  timer = setTimeout(() => { locked.value = true }, IDLE_MS)
}

/** 解锁（复用登录密码验证） */
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
