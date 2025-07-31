module.exports = {
  apps: [
    {
      name: 'easydoor-api',
      script: './server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 8009
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8009
      },
      // PM2 specific configurations
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Auto restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Health monitoring
      health_check_interval: 30000,
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Environment variables from .env file
      env_file: '.env'
    }
  ]
};