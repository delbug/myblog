<template>
  <div :style="depth > 0 ? { marginLeft: '24px', paddingLeft: '16px', borderLeft: '2px solid #f0f0f0' } : {}">
    <a-comment
      :author="comment.authorName"
      :datetime="formatDate(comment.createdAt)"
    >
      <template #content>
        <a-typography-text v-if="replyToName" type="secondary" style="font-size: 12px; display: block">
          回复 @{{ replyToName }}
        </a-typography-text>
        <div>{{ comment.content }}</div>
      </template>
      <template #actions>
        <span @click="emit('reply', comment)">
          <a-typography-link>回复</a-typography-link>
        </span>
      </template>
    </a-comment>

    <CommentItem
      v-for="reply in (comment.replies || [])"
      :key="reply.id"
      :comment="reply"
      :post-id="postId"
      :depth="depth + 1"
      :reply-to-name="comment.authorName"
      @reply="emit('reply', $event)"
    />
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
