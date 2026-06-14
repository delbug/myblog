<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="site-app">
      <AppHeader />
      <a-layout-content class="site-content">
        <slot />
      </a-layout-content>
      <AppFooter />
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'

import 'ant-design-vue/dist/reset.css'
import '~/assets/css/site-antd.css'
</script>
