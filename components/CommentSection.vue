<template>
  <section class="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
    <h3 class="mb-4 text-lg font-semibold">评论 ({{ totalCount }})</h3>

    <form class="mb-6 space-y-3" @submit.prevent="submitComment">
      <div v-if="!isLoggedIn" class="grid gap-3 sm:grid-cols-2">
        <input v-model="form.authorName" class="input" placeholder="昵称 *" required />
        <input v-model="form.authorEmail" class="input" type="email" placeholder="邮箱（可选）" />
      </div>
      <p v-else class="text-sm text-gray-500">以 {{ user?.username }} 身份评论</p>
      <textarea v-model="form.content" class="input min-h-[100px]" placeholder="写下你的评论..." required />
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? '提交中...' : '发表评论' }}
      </button>
      <p v-if="message" class="text-sm" :class="messageType === 'success' ? 'text-green-600' : 'text-red-600'">{{ message }}</p>
    </form>

    <div class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        @reply="startReply"
      />
      <p v-if="comments.length === 0" class="text-sm text-gray-500">暂无评论，来抢沙发吧！</p>
    </div>

    <!-- 回复框 -->
    <div v-if="replyTo" class="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
      <p class="mb-2 text-sm">回复 @{{ replyTo.authorName }}</p>
      <textarea v-model="replyContent" class="input min-h-[80px]" placeholder="写下回复..." />
      <div class="mt-2 flex gap-2">
        <button class="btn-primary" @click="submitReply">提交回复</button>
        <button class="btn-secondary" @click="replyTo = null">取消</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/** 评论组件：嵌套回复 + 登录用户 */
const props = defineProps<{ postId: number }>()
const { user, isLoggedIn } = useAuth()

const form = reactive({ authorName: '', authorEmail: '', content: '' })
const submitting = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const replyTo = ref<{ id: number; authorName: string } | null>(null)
const replyContent = ref('')

const { data, refresh } = await useFetch('/api/comments', { query: { postId: props.postId } })
const comments = computed(() => data.value?.data || [])

const totalCount = computed(() => {
  let n = 0
  function count(list: Array<{ replies?: unknown[] }>) {
    for (const c of list) { n++; if (c.replies?.length) count(c.replies as Array<{ replies?: unknown[] }>) }
  }
  count(comments.value)
  return n
})

async function submitComment() {
  submitting.value = true
  message.value = ''
  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: { postId: props.postId, ...form },
    })
    message.value = '评论已提交，等待审核'
    messageType.value = 'success'
    form.content = ''
  } catch (e: unknown) {
    message.value = (e as { data?: { message?: string } })?.data?.message || '提交失败'
    messageType.value = 'error'
  } finally {
    submitting.value = false
  }
}

function startReply(comment: { id: number; authorName: string }) {
  replyTo.value = comment
  replyContent.value = ''
}

async function submitReply() {
  if (!replyTo.value || !replyContent.value.trim()) return
  await $fetch('/api/comments', {
    method: 'POST',
    body: {
      postId: props.postId,
      parentId: replyTo.value.id,
      authorName: user.value?.username || form.authorName,
      content: replyContent.value,
    },
  })
  replyTo.value = null
  replyContent.value = ''
  message.value = '回复已提交，等待审核'
  messageType.value = 'success'
}
</script>
