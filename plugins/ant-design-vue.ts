import Antd from 'ant-design-vue'

/** 后台 Ant Design Vue（组件全局注册；样式在 admin 布局内按需引入） */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Antd)
})
