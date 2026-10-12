module.exports = {
  apps: [
    {
      name: 'real-estate-api',
      script: './backend/src/server.js',
      instances: 'max', // Scale to available CPU cores in production
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      max_memory_restart: '500M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 4000,
      listen_timeout: 8000,
      kill_timeout: 5000
    }
  ]
};
