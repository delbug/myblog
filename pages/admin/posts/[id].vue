<template>
  <AdminPostForm :post-id="postId" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const postId = computed(() => Number(route.params.id) || 0)
</script>
