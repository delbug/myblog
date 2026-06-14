import Antd from 'ant-design-vue'

/** Ant Design Vue 全局注册（样式在 default / admin 布局内引入） */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Antd)
})
