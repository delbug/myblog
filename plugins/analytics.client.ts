/**
 * Google Analytics + 百度统计
 * 在 .env 配置 NUXT_PUBLIC_GA_ID / NUXT_PUBLIC_BAIDU_TONGJI_ID
 */
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  let gaId = config.public.gaId as string
  let baiduId = config.public.baiduTongjiId as string

  try {
    const res = await $fetch<{ data: Record<string, string> }>('/api/settings')
    gaId = res.data?.gaId || gaId
    baiduId = res.data?.baiduTongjiId || baiduId
  } catch {
    // 使用 .env 中的默认值
  }

  if (gaId) {
    useHead({
      script: [
        { src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`, async: true },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `,
        },
      ],
    })
  }

  if (baiduId) {
    useHead({
      script: [
        {
          innerHTML: `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?${baiduId}";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);
            })();
          `,
        },
      ],
    })
  }
})
