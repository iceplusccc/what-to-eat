# 随机美食推荐功能实现指南

## 📋 功能概述

实现了一个完整的"随机推荐美食并搜索附近店铺"的功能，包括：

1. **地理定位**：获取用户当前位置（经纬度）
2. **加权随机选菜**：从本地数据库随机选择菜品，考虑热度值
3. **附近餐厅搜索**：查询用户周围的餐厅（基于本地数据库）
4. **地图集成**：集成高德地图 API，支持查看餐厅位置
5. **推荐历史**：记录用户的推荐历史，方便后续分析

## 🗂️ 项目结构

### 后端（Express.js）

```
serve/
├── routes/
│   ├── recommendation.js         # 推荐相关 API 路由
│   └── js/
│       └── mysql.js              # 数据库连接
├── utils/
│   └── amapService.js            # 高德地图 API 封装
├── init_foods_db.sql             # 数据库初始化脚本
├── app.js                        # Express 应用入口
└── package.json                  # 后端依赖（新增 axios）
```

### 前端（Vue 3）

```
src/
├── views/
│   ├── RandomSelect.vue          # 随机推荐页面（新建）
│   └── section.vue               # 主页面（已更新）
├── api/
│   └── recommendation.js         # 推荐 API 接口（新建）
├── router.js                     # 路由配置（已更新）
└── utils/
    └── request.js                # HTTP 请求封装
```

### 数据库表结构

#### 1. `foods` 表（美食菜品）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR | 菜品名称 |
| category | VARCHAR | 菜系（如川菜、粤菜） |
| sub_category | VARCHAR | 子分类 |
| image_url | VARCHAR | 图片地址 |
| description | VARCHAR | 描述 |
| avg_price | DECIMAL | 平均价格 |
| tags | VARCHAR | 标签（逗号分隔） |
| **popularity** | INT | 热度值（1-100），用于加权随机 |
| created_at | TIMESTAMP | 创建时间 |

#### 2. `restaurants` 表（餐厅店铺）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR | 店铺名称 |
| address | VARCHAR | 详细地址 |
| **latitude** | DECIMAL | 纬度 |
| **longitude** | DECIMAL | 经度 |
| phone | VARCHAR | 电话 |
| rating | DECIMAL | 评分 |
| delivery_fee | DECIMAL | 配送费 |
| min_order | DECIMAL | 起送价 |
| delivery_time | INT | 配送时间（分钟） |
| opening_hours | VARCHAR | 营业时间 |
| image_url | VARCHAR | 店铺图片 |
| status | ENUM | 营业状态 |
| created_at | TIMESTAMP | 创建时间 |

#### 3. `recommendation_history` 表（推荐历史）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| account_id | INT | 账户ID（外键） |
| food_id | INT | 菜品ID（外键） |
| latitude | DECIMAL | 推荐时的纬度 |
| longitude | DECIMAL | 推荐时的经度 |
| created_at | TIMESTAMP | 推荐时间 |

## 🚀 快速开始

### 1. 数据库初始化

在 MySQL 中执行 `serve/init_foods_db.sql` 文件，创建表并插入示例数据：

```bash
mysql -u root -p what_to_eat < serve/init_foods_db.sql
```

或者在 MySQL Workbench / 命令行工具中复制脚本内容执行。

### 2. 配置高德地图 API（可选）

编辑 `serve/utils/amapService.js`，替换 API Key：

```javascript
const AMAP_CONFIG = {
    WEB_API_KEY: 'YOUR_AMAP_WEB_API_KEY',
    SERVER_API_KEY: 'YOUR_AMAP_SERVER_API_KEY',
    BASE_URL: 'https://restapi.amap.com/v3'
};
```

获取 API Key 方法：
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册开发者账号并登录
3. 创建新应用并获取 Web 服务 API Key
4. 在应用中添加密钥配置

### 3. 安装依赖

```bash
# 后端
cd serve
npm install

# 前端（如需要）
cd ..
npm install
```

### 4. 启动应用

```bash
# 后端服务（新开终端，在 serve 目录）
cd serve
npm start

# 前端服务（新开终端，在根目录）
npm run serve
```

访问 http://localhost:8080 登录后，点击"随便吃点吧"进入随机推荐页面。

## 📡 API 端点说明

### GET /recommendation/random

获取随机推荐菜品和附近店铺。

**查询参数：**

```javascript
{
  latitude: number,        // 用户纬度（必需）
  longitude: number,       // 用户经度（必需）
  category: string,        // 菜系筛选（可选）
  max_price: number,       // 价格上限（可选）
  radius: number          // 搜索半径米数（可选，默认3000）
}
```

**返回示例：**

```javascript
{
  code: 0,
  reason: "推荐成功",
  food: {
    id: 1,
    name: "宫保鸡丁",
    category: "川菜",
    image_url: "/images/foods/gongbao_chicken.jpg",
    description: "经典川菜，花生和鸡丁的完美组合",
    avg_price: 38.00,
    tags: ["辣", "下饭"],
    popularity: 95
  },
  nearbyRestaurants: [
    {
      id: 1,
      name: "川味轩",
      address: "西城区复兴门内大街1号",
      distance: 1200,          // 单位：米
      rating: 4.8,
      delivery_fee: 5.00,
      delivery_time: 35,
      phone: "010-66095588"
    }
    // ... 更多餐厅
  ],
  location: {
    latitude: 39.9042,
    longitude: 116.3554,
    address: "北京市西城区"
  },
  timestamp: "2025-12-11T10:30:00.000Z"
}
```

### GET /recommendation/history

获取当前用户的推荐历史（需要 JWT 认证）。

**返回示例：**

```javascript
{
  code: 0,
  data: [
    {
      id: 1,
      account_id: 1,
      food_id: 1,
      food_name: "宫保鸡丁",
      category: "川菜",
      created_at: "2025-12-11 10:30:00"
    }
  ],
  total: 1
}
```

### GET /recommendation/stats

获取推荐统计信息。

**返回示例：**

```javascript
{
  code: 0,
  data: {
    total_foods: 15,
    total_restaurants: 8,
    total_recommendations: 42,
    categories_count: 7
  }
}
```

## 🔄 数据流程图

```
用户登录
   ↓
进入主页 (section.vue)
   ↓
点击 "随便吃点吧" 按钮
   ↓
跳转到随机推荐页面 (RandomSelect.vue)
   ↓
请求地理定位权限
   ↓
[成功] 获取经纬度 ──→ [拒绝] 使用默认位置（北京）
   ↓
发送 GET /recommendation/random 请求
   ├─ 参数：latitude, longitude, category(可选), max_price(可选)
   ↓
后端处理流程
   ├─ 1. 构建 SQL 查询条件
   ├─ 2. 执行加权随机选菜
   ├─ 3. 记录推荐历史
   ├─ 4. 查询数据库中的附近餐厅
   ├─ 5. （可选）调用高德 API 获取实时 POI 数据
   ├─ 6. 组装返回数据
   ↓
前端收到响应
   ├─ 显示菜品信息（图片、名称、描述、价格、标签）
   ├─ 显示附近餐厅列表（可按距离/评分/配送时间排序）
   ├─ 显示用户位置信息
   ↓
用户交互
   ├─ [换一个] → 重新请求 API
   ├─ [筛选] → 添加条件重新请求
   ├─ [拨号] → 调用餐厅电话
   └─ [查看地图] → 打开高德地图 Web 版本
```

## 🧮 加权随机算法

在 `recommendation.js` 中使用的 SQL：

```sql
SELECT * FROM foods 
WHERE [筛选条件]
ORDER BY RAND() * (popularity / 100 + 1) DESC 
LIMIT 1
```

**原理：**
- 基础随机：`RAND()` 生成 0-1 的随机数
- 权重系数：`popularity / 100 + 1`
  - popularity = 50 时，系数 = 1.5
  - popularity = 95 时，系数 = 1.95
  - 热度越高，被选中的概率越高

## 📍 距离计算

使用 **Haversine 公式** 计算两点间的大圆距离（球面距离）：

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}
```

在数据库中也使用相近公式计算距离：

```sql
ROUND(
    6371 * 2 * ASIN(
        SQRT(
            POW(SIN(RADIANS((latitude - ?) / 2)), 2) +
            COS(RADIANS(?)) * COS(RADIANS(latitude)) *
            POW(SIN(RADIANS((longitude - ?) / 2)), 2)
        )
    ) * 1000
) AS distance
```

## 🎯 功能特性

### 前端功能

- ✅ 地理定位（浏览器 Geolocation API）
- ✅ 位置回退策略（用户拒绝时使用默认位置）
- ✅ 菜品信息展示（图片、名称、描述、价格、标签、热度）
- ✅ 餐厅列表展示（距离、评分、配送费、配送时间）
- ✅ 多种排序方式（距离、评分、配送时间）
- ✅ 筛选对话框（菜系、价格范围、搜索半径）
- ✅ 拨号功能（点击拨打餐厅电话）
- ✅ 地图集成（打开高德地图查看位置）
- ✅ 加载状态和空状态展示

### 后端功能

- ✅ 加权随机选菜（考虑热度值）
- ✅ 条件筛选（菜系、价格）
- ✅ 地理距离计算（Haversine 公式）
- ✅ 推荐历史记录
- ✅ 统计信息查询
- ✅ JWT 认证（部分端点）
- ✅ 高德地图 API 封装（可选）

## 🔧 自定义配置

### 修改搜索半径

在 `RandomSelect.vue` 中：

```javascript
const filterForm = reactive({
    category: '',
    max_price: [0, 200],
    radius: 3000  // 改为需要的米数
})
```

### 修改排序方式

在 `RandomSelect.vue` 中的 `sortRestaurants()` 函数：

```javascript
if (sortBy.value === 'distance') {
    restaurants.sort((a, b) => a.distance - b.distance)
}
```

### 修改餐厅数量限制

在 `recommendation.js` 中：

```sql
LIMIT 20  // 改为需要的数量
```

## 📝 数据库迁移注意事项

如果你的数据库已存在旧表结构，可能需要：

1. **备份现有数据**
   ```sql
   CREATE TABLE foods_backup AS SELECT * FROM foods;
   ```

2. **删除旧表**（仅在确认备份后）
   ```sql
   DROP TABLE IF EXISTS foods;
   DROP TABLE IF EXISTS restaurants;
   DROP TABLE IF EXISTS recommendation_history;
   ```

3. **执行初始化脚本**
   ```bash
   mysql -u root -p what_to_eat < serve/init_foods_db.sql
   ```

## 🐛 常见问题排查

### 1. 菜品不显示
- 确保数据库中有数据：`SELECT COUNT(*) FROM foods;`
- 检查 foods 表的 popularity 字段值是否正确

### 2. 附近餐厅为空
- 确保 restaurants 表有数据
- 检查 status 字段是否为 'open'
- 尝试增大搜索半径

### 3. 地理定位失败
- 确认页面使用 HTTPS（localhost 除外）
- 检查浏览器地理定位权限
- 查看浏览器控制台错误信息

### 4. 高德 API 调用失败
- 确认 API Key 配置正确
- 检查 API Key 是否有权限调用周边搜索接口
- 查看高德开放平台的配额限制

## 📚 参考资源

- [高德开放平台文档](https://lbs.amap.com/api/webservice/guide/api)
- [Vue 3 官方文档](https://v3.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Express.js 文档](https://expressjs.com/)
- [Haversine 公式详解](https://en.wikipedia.org/wiki/Haversine_formula)

## 📞 技术支持

如遇到问题，请检查：

1. 后端服务是否正常运行（`npm start`）
2. 前端服务是否正常运行（`npm run serve`）
3. 数据库连接是否正常
4. 浏览器控制台是否有错误
5. 网络请求（F12 Network 标签）是否成功

---

**创建日期**：2025-12-11
**最后更新**：2025-12-11
