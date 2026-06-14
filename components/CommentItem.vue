<template>
  <div
    class="comment-item"
    :class="depth > 0 ? 'ml-4 border-l-2 border-primary-200 pl-4 dark:border-primary-800' : ''"
  >
    <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
      <div class="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span class="font-medium text-primary-700 dark:text-primary-400">{{ comment.authorName }}</span>
        <span v-if="replyToName" class="text-xs text-gray-400">回复 @{{ replyToName }}</span>
        <span class="text-gray-400">{{ formatDate(comment.createdAt) }}</span>
      </div>
      <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{{ comment.content }}</p>
      <button class="mt-2 text-xs text-primary-600 hover:underline" @click="emit('reply', comment)">回复</button>
    </div>

    <div v-if="comment.replies?.length" class="mt-3 space-y-3">
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :post-id="postId"
        :depth="depth + 1"
        :reply-to-name="comment.authorName"
        @reply="emit('reply', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

interface CommentNode {
  id: number
  authorName: string
  content: string
  createdAt: string
  replies?: CommentNode[]
}

withDefaults(defineProps<{
  comment: CommentNode
  postId: number
  depth?: number
  replyToName?: string
}>(), { depth: 0 })

const emit = defineEmits<{ reply: [comment: { id: number; authorName: string }] }>()
</script>
