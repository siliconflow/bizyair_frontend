#!/bin/bash

set -e

echo "=== 启动BizyAir前端开发构建流程 ==="

# 计算目录位置
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
FRONTEND_DIR="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
BIZYUI_JS_DIR="$FRONTEND_DIR/bizyui/js"
BIZYAIR_DIR="$( cd "$FRONTEND_DIR/.." &> /dev/null && pwd )"
TARGET_JS_DIR="$BIZYAIR_DIR/js"

# 清理之前的构建
rm -rf "$FRONTEND_DIR/dist"

# 构建前端
echo "正在构建前端..."
cd "$FRONTEND_DIR" && npm run build

# 确保bizyui/js目录存在
mkdir -p "$BIZYUI_JS_DIR"

# 复制编译后的前端文件到bizyui/js目录
echo "正在复制编译好的前端文件到bizyui/js目录..."

if [ -f "$FRONTEND_DIR/dist/bizyair_frontend.js" ]; then
  cp "$FRONTEND_DIR/dist/bizyair_frontend.js" "$BIZYUI_JS_DIR/bizyair_frontend.js"
elif [ -d "$FRONTEND_DIR/dist/assets" ] && [ -n "$(ls -A "$FRONTEND_DIR/dist/assets/"*.js 2>/dev/null)" ]; then
  for file in "$FRONTEND_DIR/dist/assets/"*.js; do
    cp "$file" "$BIZYUI_JS_DIR/bizyair_frontend.js"
  done
else
  echo "警告: 编译后的前端文件未在预期位置找到!"
  echo "请检查Vite构建输出位置。"
  exit 1
fi

echo "前端文件已成功复制到 $BIZYUI_JS_DIR"
ls -la "$BIZYUI_JS_DIR"

# 确保目标JS目录存在
mkdir -p "$TARGET_JS_DIR"

# 复制bizyui/js中的所有文件到BizyAir/js目录
cp -rfv "$BIZYUI_JS_DIR/"* "$TARGET_JS_DIR/"


echo "所有文件已成功复制到 $TARGET_JS_DIR"
