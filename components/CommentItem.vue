<template>
  <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
    <div class="mb-2 flex items-center gap-2 text-sm">
      <span class="font-medium">{{ comment.authorName }}</span>
      <span class="text-gray-400">{{ formatDate(comment.createdAt) }}</span>
    </div>
    <p class="text-sm text-gray-700 dark:text-gray-300">{{ comment.content }}</p>
    <button class="mt-2 text-xs text-primary-600 hover:underline" @click="emit('reply', comment)">回复</button>

    <!-- 嵌套回复 -->
    <div v-if="comment.replies?.length" class="mt-3 space-y-3 border-l-2 border-gray-200 pl-4 dark:border-gray-600">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :post-id="postId"
        @reply="emit('reply', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

defineProps<{
  comment: { id: number; authorName: string; content: string; createdAt: string; replies?: unknown[] }
  postId: number
}>()

const emit = defineEmits<{ reply: [comment: { id: number; authorName: string }] }>()
</script>
