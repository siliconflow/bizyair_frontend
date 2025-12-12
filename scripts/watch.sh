#!/bin/bash

set -e

# 计算目录位置
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
FRONTEND_DIR="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
BIZYUI_JS_DIR="$FRONTEND_DIR/bizyui/js"
BIZYAIR_DIR="$( cd "$FRONTEND_DIR/.." &> /dev/null && pwd )"
TARGET_JS_DIR="$BIZYAIR_DIR/js"

echo "启动BizyAir前端开发监视器 (Ctrl+C停止)"

# 创建必要目录
mkdir -p "$BIZYUI_JS_DIR" "$TARGET_JS_DIR"

# 使用trap捕获退出信号
trap "echo '停止监视'; exit" INT TERM EXIT

# 创建文件复制脚本
cat > "$SCRIPT_DIR/copy_files.sh" << 'EOF'
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
EOF

chmod +x "$SCRIPT_DIR/copy_files.sh"

# 使用Node.js监听文件变化并在dist发生变化时复制文件
(cd "$FRONTEND_DIR" && node -e "
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let debounceTimer;

// 定义文件复制函数
const copyFiles = () => {
  exec('bash ${SCRIPT_DIR}/copy_files.sh', (error) => {
    if (error) console.error('复制文件失败:', error);
  });
};

// 创建监听器
fs.watch(path.join(process.cwd()), { recursive: true }, (eventType, filename) => {
  if (filename && filename.startsWith('dist/')) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(copyFiles, 1000);
  }
});

// 启动Vite的watch模式
const { spawn } = require('child_process');
const vite = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
vite.on('close', (code) => process.exit(code));
") &

wait 