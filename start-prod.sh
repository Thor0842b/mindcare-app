#!/bin/bash
cd /home/devangkulmethe123/mental-health-app
npx next start --port 3000 > /tmp/next-prod.log 2>&1 &
echo "Production server on http://localhost:3000"
echo "Logs: /tmp/next-prod.log"
