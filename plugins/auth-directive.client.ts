/**
 * 按钮级权限指令 v-auth="'post:delete'"
 * 无权限时移除 DOM 元素
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('auth', {
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
