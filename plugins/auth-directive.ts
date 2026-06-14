/**
 * 按钮级权限指令 v-auth="'post:delete'"
 * 无权限时在客户端隐藏元素；SSR 阶段仅注册占位，避免 getSSRProps 报错
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('auth', {
    getSSRProps() {
      // SSR 先隐藏，客户端按权限显示，避免 hydration mismatch
      return { style: { display: 'none' } }
    },
    mounted(el, binding) {
      const codes = useState<string[]>('perm-codes', () => [])
      const required = binding.value as string | string[]
      const list = Array.isArray(required) ? required : [required]

      watchEffect(() => {
        const has = list.some((c) => codes.value.includes(c))
        el.style.display = has ? '' : 'none'
      })
    },
  })
})
