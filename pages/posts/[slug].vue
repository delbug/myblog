<template>
  <a-row :gutter="24">
      <a-col :xs="24" :lg="16">
        <template v-if="post">
          <SiteMainPanel>
            <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" class="site-post-detail-cover">

            <a-typography-title :level="1" style="margin-top: 0">{{ post.title }}</a-typography-title>

            <a-space wrap class="site-meta-bar">
              <NuxtLink v-if="post.author" :to="`/authors/${post.author.username}`">
                <a-typography-link strong>{{ post.author.username }}</a-typography-link>
              </NuxtLink>
              <a-typography-text type="secondary">{{ formatDate(post.publishedAt || post.createdAt, 'YYYY年MM月DD日') }}</a-typography-text>
              <NuxtLink v-if="post.category" :to="`/categories/${post.category.slug}`">
                <a-tag>{{ post.category.name }}</a-tag>
              </NuxtLink>
              <a-typography-text type="secondary">{{ post.viewCount }} 阅读</a-typography-text>
              <a-typography-text type="secondary">{{ post.likeCount || 0 }} 点赞</a-typography-text>
              <a-typography-text type="secondary">{{ post.commentCount }} 评论</a-typography-text>
            </a-space>

            <a-space class="site-action-bar">
              <a-button :type="liked ? 'primary' : 'default'" @click="toggleLike">
                <HeartOutlined /> {{ liked ? '已赞' : '点赞' }} ({{ post.likeCount || 0 }})
              </a-button>
              <a-button :type="favorited ? 'primary' : 'default'" @click="toggleFavorite">
                <StarOutlined /> {{ favorited ? '已收藏' : '收藏' }}
              </a-button>
            </a-space>

            <a-space v-if="post.tags.length" wrap class="site-tag-bar">
              <NuxtLink v-for="tag in post.tags" :key="tag.id" :to="`/tags/${tag.slug}`">
                <a-tag>{{ tag.name }}</a-tag>
              </NuxtLink>
            </a-space>

            <a-divider />

            <div class="prose-blog" v-html="post.htmlContent" />

            <template v-if="post.related?.length">
              <a-divider />
              <a-typography-title :level="5">相关文章</a-typography-title>
              <a-list size="small" :data-source="post.related">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <NuxtLink :to="`/posts/${item.slug}`">
                      <a-typography-link>{{ item.title }}</a-typography-link>
                    </NuxtLink>
                  </a-list-item>
                </template>
              </a-list>
            </template>

            <CommentSection :post-id="post.id" />
          </SiteMainPanel>
        </template>
      </a-col>

      <a-col :xs="24" :lg="8">
        <Sidebar />
      </a-col>
    </a-row>
</template>

<script setup lang="ts">
import { HeartOutlined, StarOutlined } from '@ant-design/icons-vue'
import { formatDate } from '~/utils/format'

const route = useRoute()
const slug = route.params.slug as string

const { data, error, refresh } = await useFetch(`/api/posts/${slug}`)

if (error.value || !data.value?.data) {
  throw createError({ statusCode: 404, message: '文章不存在' })
}

const post = computed(() => data.value!.data)
const liked = ref(false)
const favorited = ref(false)
const { isLoggedIn } = useAuth()

async function toggleLike() {
  if (!isLoggedIn.value) return navigateTo('/login')
  const res = await $fetch(`/api/posts/${post.value.id}/like`, { method: 'POST' })
  liked.value = res.data.liked
  refresh()
}

async function toggleFavorite() {
  if (!isLoggedIn.value) return navigateTo('/login')
  const res = await $fetch(`/api/posts/${post.value.id}/favorite`, { method: 'POST' })
  favorited.value = res.data.favorited
}

usePageSeo({
  title: post.value.title,
  description: post.value.summary || undefined,
  image: post.value.coverImage || undefined,
  type: 'article',
  publishedTime: post.value.publishedAt || post.value.createdAt,
  modifiedTime: post.value.updatedAt,
  author: post.value.author?.username,
  keywords: post.value.tags?.map((t: { name: string }) => t.name),
})
</script>

<style>
@import 'highlight.js/styles/github-dark.css';
</style>
