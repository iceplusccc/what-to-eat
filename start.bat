@echo off
REM 随机美食推荐功能 - Windows 快速启动脚本

echo.
echo ========================================
echo  什么吃 - 随机美食推荐功能启动
echo ========================================
echo.

REM 1. 检查 Node.js
echo [1/5] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
) else (
    echo ✓ Node.js 环境检查完毕
)

REM 2. 检查 MySQL
echo [2/5] 检查 MySQL 数据库...
REM 这里可以添加 MySQL 连接检查，当前只做提示
echo ⚠️  请确保 MySQL 服务已启动（端口 3306）
echo    数据库：what_to_eat, 用户：root, 密码：123456

REM 3. 初始化数据库
echo.
echo [3/5] 数据库初始化...
setlocal enabledelayedexpansion
set /p init_db="是否要初始化数据库？(y/n, 默认 n): "
if /i "!init_db!"=="y" (
    mysql -u root -p123456 what_to_eat < serve/init_foods_db.sql
    if errorlevel 1 (
        echo ❌ 数据库初始化失败，请手动执行 serve/init_foods_db.sql
        echo 你可以在 MySQL 客户端中执行此文件
    ) else (
        echo ✓ 数据库初始化完成
    )
)

REM 4. 安装后端依赖
echo.
echo [4/5] 安装后端依赖...
cd serve
if not exist node_modules (
    echo 正在执行 npm install...
    npm install --registry https://registry.npmmirror.com
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✓ 后端依赖已就绪
)
cd ..

REM 5. 安装前端依赖（可选）
echo.
echo [5/5] 检查前端依赖...
if not exist node_modules (
    echo 正在执行 npm install...
    npm install --registry https://registry.npmmirror.com
) else (
    echo ✓ 前端依赖已就绪
)

REM 启动应用
echo.
echo ========================================
echo         准备启动应用
echo ========================================
echo.
echo 后端服务将在 http://127.0.0.1:5000 运行
echo 前端应用将在 http://localhost:8080 运行
echo.
echo 按任意键继续...
pause

echo.
echo [正在启动后端服务...]
start cmd /k "cd serve && npm start"

REM 等待后端启动
timeout /t 3 /nobreak

echo [正在启动前端应用...]
echo.
echo 请在新窗口中执行：npm run serve
echo.
pause
