<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">写新文章</h1>

    <form class="card space-y-4" @submit.prevent>
      <div>
        <label class="mb-1 block text-sm">标题 *</label>
        <input v-model="form.title" class="input" required />
      </div>

      <div>
        <label class="mb-1 block text-sm">URL Slug</label>
        <input v-model="form.slug" class="input" placeholder="留空则自动生成" />
      </div>

      <div>
        <label class="mb-1 block text-sm">摘要</label>
        <input v-model="form.summary" class="input" placeholder="留空则从正文自动提取" />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm">分类</label>
          <select v-model="form.categoryId" class="input">
            <option :value="null">无分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            点击下方「保存草稿」或「发布」按钮提交
          </p>
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm">标签</label>
        <div class="flex flex-wrap gap-2">
          <label v-for="tag in tags" :key="tag.id" class="flex items-center gap-1 text-sm">
            <input type="checkbox" :value="tag.id" v-model="form.tagIds" />
            {{ tag.name }}
          </label>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm">封面图 URL</label>
          <input v-model="form.coverImage" class="input" placeholder="上传图片后粘贴 URL，或留空" />
        </div>
        <div>
          <label class="mb-1 block text-sm">SEO 关键词</label>
          <input v-model="form.seoKeyword" class="input" placeholder="逗号分隔，如：Vue,Nuxt,博客" />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-sm">正文 (Markdown) *</label>
        <MarkdownEditor v-model="form.content" />
      </div>

      <div class="flex items-center gap-2">
        <input id="isTop" v-model="form.isTop" type="checkbox" :true-value="1" :false-value="0" />
        <label for="isTop" class="text-sm">置顶</label>
      </div>

      <p v-if="message" class="text-sm" :class="messageOk ? 'text-green-600' : 'text-red-600'">{{ message }}</p>

      <div class="flex gap-3">
        <button type="button" class="btn-secondary" :disabled="saving" @click="save('draft')">
          {{ saving && savingAs === 'draft' ? '保存中...' : '保存草稿' }}
        </button>
        <button type="button" class="btn-primary" :disabled="saving" @click="save('published')">
          {{ saving && savingAs === 'published' ? '发布中...' : '发布' }}
        </button>
        <NuxtLink to="/admin/posts" class="btn-secondary">返回列表</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
/** 新建文章页 */
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const form = reactive({
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  seoKeyword: '',
  categoryId: null as number | null,
  status: 'draft' as 'draft' | 'published',
  tagIds: [] as number[],
  isTop: 0,
})

const saving = ref(false)
const savingAs = ref<'draft' | 'published' | null>(null)
const message = ref('')
const messageOk = ref(true)

const { data: categoriesData } = await useFetch('/api/categories')
const { data: tagsData } = await useFetch('/api/tags')
const categories = computed(() => categoriesData.value?.data || [])
const tags = computed(() => tagsData.value?.data || [])

/** 创建新文章，status 由按钮决定（草稿 / 发布） */
async function save(status: 'draft' | 'published') {
  saving.value = true
  savingAs.value = status
  message.value = ''
  try {
    await $fetch('/api/admin/posts', {
      method: 'POST',
      body: { ...form, status },
    })
    messageOk.value = true
    message.value = status === 'published' ? '文章已发布' : '草稿已保存'
    navigateTo('/admin/posts')
  } catch (e: unknown) {
    messageOk.value = false
    message.value = (e as { data?: { message?: string } })?.data?.message || '保存失败'
  } finally {
    saving.value = false
    savingAs.value = null
  }
}
</script>
