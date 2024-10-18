call npm ci
call npm run build
pm2 start ecosystem.config.js --env dev > logs\startDashboard.err 2>&1