module.exports = {
  name: "labora-clinical-lab",
  apps: [
    {
      name: "labora-api",
      script: "dist/main.js",
      cwd: "/var/www/labora",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_HOST: "localhost",
        DATABASE_PORT: 5432,
        DATABASE_NAME: "labora_db",
        DATABASE_USER: "labora_user",
        DATABASE_SSL: true
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/pm2/labora-error.log",
      out_file: "/var/log/pm2/labora-out.log",
      log_file: "/var/log/pm2/labora-combined.log",
      merge_logs: true,
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      listen_timeout: 3000,
      kill_timeout: 5000,
      wait_ready: true,
      health_check_url: "http://localhost:3000/health"
    }
  ]
};