#!/bin/bash

# 随机美食推荐功能 - Linux/Mac 快速启动脚本

echo ""
echo "========================================"
echo "  什么吃 - 随机美食推荐功能启动"
echo "========================================"
echo ""

# 1. 检查 Node.js
echo "[1/5] 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到 Node.js，请先安装 Node.js"
    exit 1
else
    node --version
    echo "✓ Node.js 环境检查完毕"
fi

# 2. 检查 MySQL
echo ""
echo "[2/5] 检查 MySQL 数据库..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  警告：未检测到 mysql 命令"
    echo "  请确保 MySQL 服务已启动"
else
    echo "✓ MySQL 命令已找到"
fi
echo "  数据库：what_to_eat, 用户：root, 密码：123456"

# 3. 初始化数据库
echo ""
echo "[3/5] 数据库初始化..."
read -p "是否要初始化数据库？(y/n, 默认 n): " init_db
if [ "$init_db" = "y" ] || [ "$init_db" = "Y" ]; then
    mysql -u root -p123456 what_to_eat < serve/init_foods_db.sql
    if [ $? -eq 0 ]; then
        echo "✓ 数据库初始化完成"
    else
        echo "❌ 数据库初始化失败，请手动执行 serve/init_foods_db.sql"
        echo "  你可以在 MySQL 客户端中执行此文件"
    fi
fi

# 4. 安装后端依赖
echo ""
echo "[4/5] 安装后端依赖..."
cd serve
if [ ! -d "node_modules" ]; then
    echo "正在执行 npm install..."
    npm install --registry https://registry.npmmirror.com
    if [ $? -ne 0 ]; then
        echo "❌ 后端依赖安装失败"
        cd ..
        exit 1
    fi
else
    echo "✓ 后端依赖已就绪"
fi
cd ..

# 5. 安装前端依赖（可选）
echo ""
echo "[5/5] 检查前端依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在执行 npm install..."
    npm install --registry https://registry.npmmirror.com
else
    echo "✓ 前端依赖已就绪"
fi

# 启动应用
echo ""
echo "========================================"
echo "         准备启动应用"
echo "========================================"
echo ""
echo "后端服务将在 http://127.0.0.1:5000 运行"
echo "前端应用将在 http://localhost:8080 运行"
echo ""

# 后端启动
echo "[正在启动后端服务...]"
cd serve
npm start &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 前端启动
echo "[正在启动前端应用...]"
npm run serve

# 清理
kill $BACKEND_PID 2>/dev/null
