#!/bin/bash

set -e

echo "=== Starting BizyAir frontend integration build process ==="

# 确保bizyui/js目录存在
mkdir -p bizyui/js

# 复制编译后的前端文件到bizyui目录
echo "Copying compiled frontend files to bizyui package..."
# Vite在lib模式下可能直接输出到dist目录或dist/assets目录
if [ -f dist/bizyair_frontend.js ]; then
  cp dist/bizyair_frontend.js bizyui/js/bizyair_frontend.js
elif [ -d dist/assets ] && [ -n "$(ls -A dist/assets/*.js 2>/dev/null)" ]; then
  cp dist/assets/*.js bizyui/js/bizyair_frontend.js
else
  echo "WARNING: Compiled frontend file not found in expected locations!"
  echo "Please check the Vite build output location."
  exit 1
fi
echo "Frontend files copied successfully!"

# 确保__init__.py文件存在
if [ ! -f bizyui/__init__.py ]; then
  touch bizyui/__init__.py
  echo "__init__.py file created!"
fi

# 构建Python包
echo "Building Python package..."

# 清理旧的构建文件
rm -rf build bizyui.egg-info

# 构建Python包
python -m build

echo "BizyUI package built successfully!"
echo "Wheel package is available in the dist/ directory"

echo "=== BizyAir frontend integration build completed! ===" 