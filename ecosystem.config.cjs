module.exports = {
  apps: [
    {
      name: 'vue-blog',
      script: '.output/server/index.mjs',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NITRO_PORT: 3000,
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      max_memory_restart: '512M',
    },
  ],
}
