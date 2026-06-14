<template>
  <div>
    <AdminPageHeader :title="isEdit ? '编辑文章' : '写新文章'" :breadcrumb="breadcrumb">
      <template #extra>
        <a-space>
          <a-button @click="navigateTo('/admin/posts')">返回列表</a-button>
          <a-button :loading="saving && savingAs === 'draft'" @click="save('draft')">保存草稿</a-button>
          <a-button type="primary" :loading="saving && savingAs === 'published'" @click="save('published')">发布</a-button>
        </a-space>
      </template>
    </AdminPageHeader>

    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :xs="24" :lg="16">
          <a-card title="正文">
            <a-form-item label="标题" required>
              <a-input v-model:value="form.title" placeholder="文章标题" />
            </a-form-item>
            <a-form-item label="正文" required>
              <ArticleEditor v-model="form.content" />
            </a-form-item>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="8">
          <a-card title="发布设置" class="mb-4">
            <a-form-item label="状态">
              <a-tag :color="form.status === 'published' ? 'success' : 'warning'">
                {{ form.status === 'published' ? '已发布' : '草稿' }}
              </a-tag>
            </a-form-item>
            <a-form-item label="URL Slug">
              <a-input v-model:value="form.slug" placeholder="留空自动生成" />
            </a-form-item>
            <a-form-item label="摘要">
              <a-textarea v-model:value="form.summary" :rows="3" placeholder="留空则从正文提取" />
            </a-form-item>
            <a-form-item label="分类">
              <a-select v-model:value="form.categoryId" allow-clear placeholder="无分类">
                <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="作者">
              <a-select v-model:value="form.authorId" placeholder="选择作者">
                <a-select-option v-for="u in adminUsers" :key="u.id" :value="u.id">{{ u.username }} ({{ u.role }})</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="置顶">
              <a-switch :checked="form.isTop === 1" @change="(v: boolean) => form.isTop = v ? 1 : 0" />
            </a-form-item>
          </a-card>

          <a-card title="标签与 SEO">
            <a-form-item label="标签">
              <a-checkbox-group v-model:value="form.tagIds" class="flex flex-col gap-1">
                <a-checkbox v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
            <a-form-item label="封面图">
              <ImageUpload v-model="form.coverImage" placeholder="上传或粘贴 URL" />
            </a-form-item>
            <a-form-item label="SEO 关键词">
              <a-input v-model:value="form.seoKeyword" placeholder="逗号分隔" />
            </a-form-item>
          </a-card>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'

const props = defineProps<{ postId?: number }>()

const isEdit = computed(() => !!props.postId)

const breadcrumb = computed(() =>
  isEdit.value
    ? [{ label: '文章管理', to: '/admin/posts' }, { label: '编辑文章' }]
    : [{ label: '文章管理', to: '/admin/posts' }, { label: '写新文章' }],
)

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
  authorId: null as number | null,
  isTop: 0,
})

const saving = ref(false)
const savingAs = ref<'draft' | 'published' | null>(null)

const { data: categoriesData } = await useFetch('/api/categories')
const { data: tagsData } = await useFetch('/api/tags')
const { data: usersData } = await useFetch('/api/admin/users')
const categories = computed(() => categoriesData.value?.data || [])
const tags = computed(() => tagsData.value?.data || [])
const adminUsers = computed(() => (usersData.value?.data?.list || usersData.value?.data || []) as Array<{ id: number; username: string; role: string }>)

if (isEdit.value && props.postId) {
  const { data } = await useFetch(`/api/admin/posts/${props.postId}`)
  if (data.value?.data) {
    const post = data.value.data
    Object.assign(form, {
      title: post.title,
      slug: post.slug,
      summary: post.summary || '',
      content: post.content,
      coverImage: post.coverImage || '',
      seoKeyword: post.seoKeyword || '',
      categoryId: post.categoryId,
      status: post.status,
      tagIds: post.tagIds || [],
      authorId: post.authorId,
      isTop: post.isTop,
    })
  }
}

async function save(status: 'draft' | 'published') {
  if (!form.title.trim()) {
    message.warning('请填写标题')
    return
  }
  saving.value = true
  savingAs.value = status
  try {
    if (isEdit.value && props.postId) {
      await $fetch(`/api/admin/posts/${props.postId}`, { method: 'PUT', body: { ...form, status } })
      form.status = status
      message.success(status === 'published' ? '文章已发布' : '草稿已保存')
    } else {
      await $fetch('/api/admin/posts', { method: 'POST', body: { ...form, status } })
      message.success(status === 'published' ? '文章已发布' : '草稿已保存')
      navigateTo('/admin/posts')
    }
  } catch (e: unknown) {
    message.error((e as { data?: { message?: string } })?.data?.message || '保存失败')
  } finally {
    saving.value = false
    savingAs.value = null
  }
}
</script>
