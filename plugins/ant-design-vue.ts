import Antd from 'ant-design-vue'

/** Ant Design Vue 全局注册；样式在 nuxt.config css 中统一注入，避免刷新 FOUC */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Antd)
})
