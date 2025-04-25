#!/bin/bash

set -e

echo "=== Starting BizyUI package build ==="

# 清理旧的构建文件
rm -rf build bizyui.egg-info

# 构建Python包
python -m build

echo "BizyUI package built successfully!"
echo "Wheel package is available in the dist/ directory"


