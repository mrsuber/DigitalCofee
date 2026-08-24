#!/bin/bash
# Deploy all enhanced pages to VPS

scp public/enhanced-index.html root@76.13.41.99:/var/www/digitalcoffee/public/index.html

echo "✅ Landing page deployed successfully!"
