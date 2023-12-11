call npm ci
pm2 start ecosystem.config.js --env staging > startDashboard.err 2>&1