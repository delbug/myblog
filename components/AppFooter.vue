<template>
  <footer class="mt-auto border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-800">
    <div class="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>&copy; {{ year }} {{ siteName }}. Built with Nuxt 3 + MySQL</p>
      <p class="mt-2">
        <NuxtLink to="/rss.xml" class="hover:text-primary-600">RSS 订阅</NuxtLink>
        <span class="mx-2">·</span>
        <a href="/sitemap.xml" class="hover:text-primary-600">Sitemap</a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
/** 站点页脚 */
const config = useRuntimeConfig()
const siteName = config.public.siteName
const year = new Date().getFullYear()
</script>
