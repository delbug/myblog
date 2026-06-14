<template>
  <a-divider />
  <section>
    <a-typography-title :level="4">评论 ({{ totalCount }})</a-typography-title>

    <a-form layout="vertical" class="mb-6" @finish="submitComment">
      <a-row v-if="!isLoggedIn" :gutter="12">
        <a-col :xs="24" :sm="12">
          <a-form-item label="昵称" required>
            <a-input v-model:value="form.authorName" placeholder="昵称" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-item label="邮箱">
            <a-input v-model:value="form.authorEmail" type="email" placeholder="邮箱（可选）" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-typography-text v-else type="secondary" style="display: block; margin-bottom: 12px">
        以 {{ user?.username }} 身份评论
      </a-typography-text>

      <a-form-item label="评论内容" required>
        <a-textarea v-model:value="form.content" :rows="4" placeholder="写下你的评论..." />
      </a-form-item>

      <a-alert v-if="message" :type="messageType === 'success' ? 'success' : 'error'" :message="message" show-icon class="mb-3" />

      <a-button type="primary" html-type="submit" :loading="submitting">发表评论</a-button>
    </a-form>

    <div v-if="comments.length">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        @reply="startReply"
      />
    </div>
    <a-empty v-else description="暂无评论，来抢沙发吧！" />

    <a-card v-if="replyTo" size="small" style="margin-top: 16px" title="回复">
      <template #extra>
        <a-button type="text" size="small" @click="replyTo = null">取消</a-button>
      </template>
      <a-typography-text type="secondary">回复 @{{ replyTo.authorName }}</a-typography-text>
      <a-textarea v-model:value="replyContent" :rows="3" placeholder="写下回复..." style="margin: 12px 0" />
      <a-button type="primary" @click="submitReply">提交回复</a-button>
    </a-card>
  </section>
</template>

<script setup lang="ts">
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
  if (!form.content.trim()) return
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
    refresh()
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
  refresh()
}
</script>
