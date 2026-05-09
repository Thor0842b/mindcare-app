#!/bin/bash
cd /home/devangkulmethe123/mental-health-app
npm run dev -- -p 3000 > /tmp/next-dev.log 2>&1 &
echo "Server started on http://localhost:3000"
echo "Logs: /tmp/next-dev.log"
