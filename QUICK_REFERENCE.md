# 快速参考卡片

## 🚀 5 分钟启动指南

```bash
# 1. 初始化数据库（仅第一次）
mysql -u root -p123456 what_to_eat < serve/init_foods_db.sql

# 2. 安装依赖（仅第一次）
cd serve && npm install && cd ..
npm install

# 3. 启动后端（终端 1）
cd serve && npm start

# 4. 启动前端（终端 2）
npm run serve

# 5. 打开浏览器
# http://localhost:8080
# 登录 → 点击"随便吃点吧" → 授权地理定位
```

---

## 📁 核心文件位置

| 功能 | 文件 | 说明 |
|------|------|------|
| **随机推荐 API** | `serve/routes/recommendation.js` | 3 个 API 端点 |
| **地图服务** | `serve/utils/amapService.js` | 高德地图封装 |
| **推荐页面** | `src/views/RandomSelect.vue` | 推荐页面 + 菜品图片处理 |
| **DIY 页面** | `src/views/DIY.vue` | 菜谱浏览 + 菜谱图片处理 |
| **推荐数据** | `serve/init_foods_db.sql` | 菜品建表（已配置图片） |
| **菜谱数据** | `serve/diy_recipes.sql` | 菜谱建表（已配置图片） |
| **菜品图片** | `serve/public/dishes/` | 51 张菜品 PNG 图片 |
| **菜谱图片** | `serve/public/recipes/` | 34 张菜谱 JPG 图片 |
| **数据库脚本** | `serve/update_*.sql` | 更新现有数据库的图片路径 |
| **路由配置** | `src/router.js` | 路由定义 |

---

## 🔗 API 端点

```
GET /recommendation/random
  必需: latitude, longitude
  可选: category, max_price, radius

GET /recommendation/history
  需要: JWT Token

GET /recommendation/stats
```

---

## 💾 数据库表

| 表名 | 记录数 | 用途 |
|------|--------|------|
| `foods` | 15 | 菜品库 |
| `restaurants` | 8 | 餐厅库 |
| `recommendation_history` | 无限 | 推荐记录 |

---

## 🎯 关键代码片段

### 加权随机选菜

```sql
SELECT * FROM foods 
ORDER BY RAND() * (popularity / 100 + 1) DESC 
LIMIT 1
```

### 距离计算

```sql
6371 * 2 * ASIN(SQRT(...)) * 1000  -- 单位：米
```

### 地理定位

```javascript
navigator.geolocation.getCurrentPosition(success, error)
```

---

## 🍽️ DIY 菜谱图片配置

### 快速开始

**新数据库：** 直接运行更新的 `serve/diy_recipes.sql`
```bash
mysql -u root -p123456 < serve/diy_recipes.sql
```

**现有数据库：** 运行更新脚本
```bash
mysql -u root -p123456 < serve/update_diy_recipes_images.sql
```

### 图片映射

| 数据库存储 | 实际文件位置 | 访问 URL |
|-----------|-----------|---------|
| `/recipes/菜品名.jpg` | `serve/public/recipes/菜品名.jpg` | `http://127.0.0.1:5000/recipes/菜品名.jpg` |

### 已配置菜谱

- 宫保鸡丁 (`/recipes/宫保鸡丁.jpg`)
- 麻婆豆腐 (`/recipes/麻婆豆腐.jpg`)
- 鱼香肉丝 (`/recipes/鱼香肉丝.jpg`)
- 清汤白切鸡 (`/recipes/白切鸡.jpg`)
- 蒜蓉蒸虾 (`/recipes/蒜蓉粉丝蒸扇贝.jpg`)
- 西湖醋鱼 (`/recipes/清蒸鲈鱼.jpg`)
- 龙井虾仁 (`/recipes/虾仁滑蛋.jpg`)
- 番茄鸡蛋面 (`/recipes/番茄炒鸡蛋.jpg`)
- 清炒空心菜 (`/recipes/蒜蓉西兰花.jpg`)

---

## ⚙️ 配置项

| 配置 | 文件 | 位置 |
|------|------|------|
| 高德 API Key | `serve/utils/amapService.js` | AMAP_CONFIG |
| 搜索半径 | `src/views/RandomSelect.vue` | filterForm.radius |
| 默认位置 | `src/views/RandomSelect.vue` | 39.9042, 116.3554 |
| 数据库信息 | `serve/routes/js/mysql.js` | connection 配置 |

---

## 🧪 快速测试

### 在浏览器中测试 API

```javascript
// 打开浏览器控制台，运行：
fetch('http://127.0.0.1:5000/recommendation/random?latitude=39.9042&longitude=116.3554')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 使用 cURL

```bash
curl "http://127.0.0.1:5000/recommendation/random?latitude=39.9042&longitude=116.3554"
```

---

## 📊 数据流

```
GPS 坐标
  ↓
API /recommendation/random
  ↓
选菜（SQL加权随机）
  ↓
查询附近餐厅（距离计算）
  ↓
组装数据
  ↓
前端展示
  ↓
用户交互（排序、筛选、拨号等）
```

---

## 🔥 最常用命令

```bash
# 启动数据库初始化
mysql -u root -p123456 what_to_eat < serve/init_foods_db.sql

# 启动后端
cd serve && npm start

# 启动前端
npm run serve

# 查看数据库
mysql -u root -p123456 -e "use what_to_eat; select count(*) from foods;"

# 清空推荐历史
mysql -u root -p123456 -e "use what_to_eat; truncate recommendation_history;"
```

---

## 🖼️ 菜品图片配置

### 快速开始

**新数据库：** 已在 `serve/init_foods_db.sql` 中配置菜品图片，直接初始化即可

**现有数据库：** 执行更新脚本
```bash
mysql -u root -p123456 what_to_eat < serve/update_dish_images.sql
```

### 图片映射

| 数据库存储 | 实际文件位置 | 访问 URL |
|-----------|-----------|---------|
| `/dishes/菜品名.png` | `serve/public/dishes/菜品名.png` | `http://127.0.0.1:5000/dishes/菜品名.png` |

### 工作流

```
API 返回 image_url
  ↓
RandomSelect.vue 中 normalizeImageUrl() 拼接完整 URL
  ↓
前端 <el-image> 组件渲染
  ↓
Express 静态文件服务
```

---

## ❓ 常见问题速查

| 问题 | 检查项 |
|------|--------|
| 菜品图片显示不出 | ✓ 数据库 image_url 字段是否为 `/dishes/菜品名.png` ✓ 文件是否存在于 `serve/public/dishes/` |
| 显示空菜品列表 | ✓ 数据库是否初始化 ✓ foods 表是否有数据 |
| 地理定位失败 | ✓ 浏览器权限 ✓ HTTPS（或 localhost） |
| API 返回错误 | ✓ 后端是否运行 ✓ 参数是否完整 |
| 高德地图不显示 | ✓ API Key 是否配置 ✓ 网络连接 |
| 无法连接数据库 | ✓ MySQL 是否启动 ✓ 密码是否正确 |

---

## 📖 详细文档

- `DISH_IMAGES_CONFIG.md` - 菜品图片完整配置说明
- `RANDOM_RECOMMENDATION_GUIDE.md` - 随机推荐完整指南
- `API_TEST_GUIDE.md` - API 文档
- `IMPLEMENTATION_SUMMARY.md` - 实现总结

---

**版本**: v1.0.0 | **日期**: 2025-12-11
