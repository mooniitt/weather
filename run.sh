#!/bin/bash

# 检查 node_modules 是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
  echo "Node modules not found. Installing dependencies..."
  npm install
fi

# 启动开发服务器
echo "Starting development server..."
npm run dev
