#!/bin/bash
set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
FRONTEND_DIR="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
BIZYUI_JS_DIR="$FRONTEND_DIR/bizyui/js"
BIZYAIR_DIR="$( cd "$FRONTEND_DIR/.." &> /dev/null && pwd )"
TARGET_JS_DIR="$BIZYAIR_DIR/js"

# 复制编译后的前端文件到bizyui/js目录
if [ -f "$FRONTEND_DIR/dist/bizyair_frontend.js" ]; then
  cp "$FRONTEND_DIR/dist/bizyair_frontend.js" "$BIZYUI_JS_DIR/bizyair_frontend.js"
elif [ -d "$FRONTEND_DIR/dist/assets" ] && [ -n "$(ls -A "$FRONTEND_DIR/dist/assets/"*.js 2>/dev/null)" ]; then
  for file in "$FRONTEND_DIR/dist/assets/"*.js; do
    cp "$file" "$BIZYUI_JS_DIR/bizyair_frontend.js"
  done
fi

# 复制bizyui/js中的所有文件到BizyAir/js目录
cp -rf "$BIZYUI_JS_DIR/"* "$TARGET_JS_DIR/"
