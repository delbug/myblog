<template>
  <div>
    <SitePageHeader title="个人中心" />

    <SiteMainPanel v-if="!isLoggedIn">
      <a-empty description="请先登录">
        <NuxtLink to="/login">
          <a-button type="primary">去登录</a-button>
        </NuxtLink>
      </a-empty>
    </SiteMainPanel>

    <SiteMainPanel v-else>
      <a-space align="start" size="large">
        <a-avatar size="large" style="background-color: #1677ff; width: 64px; height: 64px; line-height: 64px; font-size: 24px">
          {{ user?.username?.[0]?.toUpperCase() }}
        </a-avatar>
        <div>
          <a-typography-title :level="4" style="margin: 0">{{ user?.username }}</a-typography-title>
          <a-typography-text type="secondary">{{ user?.email || '未设置邮箱' }}</a-typography-text>
          <div style="margin-top: 8px">
            <a-tag>{{ user?.role === 'admin' ? '管理员' : '普通用户' }}</a-tag>
          </div>
        </div>
      </a-space>

      <a-divider />

      <a-space direction="vertical">
        <NuxtLink v-if="user?.role === 'admin'" to="/admin">
          <a-button type="primary">进入管理后台</a-button>
        </NuxtLink>
        <NuxtLink to="/user/favorites">
          <a-button>我的收藏</a-button>
        </NuxtLink>
        <a-button @click="handleLogout">退出登录</a-button>
      </a-space>
    </SiteMainPanel>
  </div>
</template>

<script setup lang="ts">
const { user, isLoggedIn, fetchUser, logout } = useAuth()

await fetchUser()

async function handleLogout() {
  await logout()
  navigateTo('/')
}
</script>
