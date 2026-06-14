<template>
  <a-layout-footer class="site-footer">
    <a-typography-text type="secondary">
      &copy; {{ year }} {{ siteName }}. Built with Nuxt 3 + MySQL
    </a-typography-text>
    <div style="margin-top: 8px">
      <NuxtLink to="/rss.xml" target="_blank">
        <a-typography-link>RSS 订阅</a-typography-link>
      </NuxtLink>
      <a-divider type="vertical" />
      <a href="/sitemap.xml">
        <a-typography-link>Sitemap</a-typography-link>
      </a>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = config.public.siteName
const year = new Date().getFullYear()
</script>
