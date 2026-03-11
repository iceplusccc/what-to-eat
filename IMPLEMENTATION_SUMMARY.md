# 随机美食推荐功能 - 完整实现总结

## 📦 实现概览

已为"什么吃"应用实现完整的**随机推荐美食并搜索附近店铺**功能。这是一个涵盖前后端的端到端解决方案。

---

## 🎯 功能清单

### ✅ 已实现功能

#### 1. 数据库模型
- **foods 表**：15 条示例美食数据（包含热度值用于加权随机）
- **restaurants 表**：8 家示例餐厅数据（包含经纬度信息）
- **recommendation_history 表**：推荐历史记录，用于个性化推荐和数据分析

#### 2. 后端 API

**`GET /recommendation/random`**
- 随机选菜（加权算法，考虑热度值）
- 条件筛选（菜系、价格范围）
- 附近餐厅查询（基于经纬度的距离计算）
- 推荐历史记录
- 返回完整的食物+餐厅组合数据

**`GET /recommendation/history`**
- 获取用户的推荐历史
- 需要 JWT 认证

**`GET /recommendation/stats`**
- 获取推荐功能统计信息
- 返回美食总数、餐厅总数、推荐次数等

#### 3. 前端页面

**RandomSelect.vue** - 随机推荐页面
- 🌍 地理定位（浏览器 Geolocation API）
- 📸 菜品展示（图片、名称、描述、价格、标签、热度）
- 🏪 餐厅列表（距离、评分、配送费、配送时间）
- 🔄 多种排序方式（距离、评分、配送时间）
- 🎛️ 筛选对话框（菜系、价格、搜索半径）
- 📱 交互功能（拨号、查看地图）
- ⚙️ 加载和空状态提示

#### 4. UI/UX 优化
- 响应式设计（支持 PC 和移动端）
- 美观的卡片布局
- 流畅的动画和过渡
- 完整的加载和错误提示

---

## 📂 文件结构

### 新建文件

```
what-to-eat/
├── serve/
│   ├── routes/
│   │   └── recommendation.js          # 推荐 API 路由
│   ├── utils/
│   │   ├── amapService.js             # 高德地图 API 封装
│   │   └── amap.config.example.js     # 高德 API 配置模板
│   ├── init_foods_db.sql              # 数据库初始化脚本
│   └── package.json                   # 新增 axios 依赖
├── src/
│   ├── views/
│   │   └── RandomSelect.vue           # 随机推荐页面
│   ├── api/
│   │   └── recommendation.js          # 前端 API 接口
│   └── router.js                      # 新增 /random-select 路由
├── RANDOM_RECOMMENDATION_GUIDE.md    # 详细实现指南
├── API_TEST_GUIDE.md                 # API 测试指南
├── start.bat                         # Windows 启动脚本
├── start.sh                          # Linux/Mac 启动脚本
└── README.md                         # 项目说明

```

### 修改文件

```
serve/
├── app.js                            # 注册 /recommendation 路由
└── package.json                      # 新增 axios 依赖

src/
├── views/
│   └── section.vue                   # 更新"随便吃点吧"按钮逻辑
└── router.js                         # 新增 /random-select 路由
```

---

## 🔧 核心技术实现

### 1. 加权随机算法

在 SQL 中实现加权随机选择：

```sql
SELECT * FROM foods 
WHERE [条件]
ORDER BY RAND() * (popularity / 100 + 1) DESC 
LIMIT 1
```

- 热度值越高，被选中概率越高
- 同时保留随机性和多样性

### 2. 地理距离计算

使用 Haversine 公式计算地球球面距离：

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + 
              Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
              Math.sin(dLon/2)*Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}
```

### 3. 地理定位机制

```javascript
navigator.geolocation.getCurrentPosition(
    (position) => {
        // 用户授权：获取经纬度
        const {latitude, longitude} = position.coords;
    },
    (error) => {
        // 用户拒绝：使用默认位置
        latitude = 39.9042;
        longitude = 116.3554;
    }
);
```

### 4. 推荐数据流

```
用户位置（GPS）
    ↓
选菜 API 请求
    ↓
后端处理
├─ 1. SQL 加权随机选菜
├─ 2. 记录推荐历史
├─ 3. 距离计算查询附近餐厅
└─ 4. 组装返回数据
    ↓
前端渲染
├─ 菜品卡片
├─ 餐厅列表（可排序和筛选）
└─ 交互功能
```

---

## 🚀 快速开始

### 1. 环境准备

**前置条件**：
- Node.js v14+
- MySQL 5.7+ (用户: root, 密码: 123456)
- 现代浏览器（支持 Geolocation API）

### 2. 数据库初始化

在 MySQL 中执行初始化脚本：

```bash
mysql -u root -p123456 what_to_eat < serve/init_foods_db.sql
```

创建的表：
- `foods` (15 条美食数据)
- `restaurants` (8 家餐厅数据)
- `recommendation_history` (推荐历史)

### 3. 安装依赖

```bash
# 后端
cd serve
npm install

# 前端（如需要）
cd ..
npm install
```

### 4. 配置高德 API（可选）

编辑 `serve/utils/amapService.js`：

```javascript
const AMAP_CONFIG = {
    SERVER_API_KEY: 'YOUR_ACTUAL_API_KEY'
};
```

### 5. 启动应用

**方式一：使用启动脚本**

```bash
# Windows
start.bat

# Linux/Mac
bash start.sh
```

**方式二：手动启动**

```bash
# 终端 1：启动后端
cd serve
npm start
# 输出：服务器启动成功：http://127.0.0.1:5000

# 终端 2：启动前端
npm run serve
# 访问：http://localhost:8080
```

### 6. 验证功能

1. 登录应用
2. 在主页点击"随便吃点吧"
3. 授权浏览器地理定位
4. 查看推荐的菜品和附近餐厅
5. 尝试"换一个"、筛选、排序等功能

---

## 📊 数据示例

### 菜品数据

15 条示例美食，覆盖多种菜系：

| 菜品名称 | 菜系 | 热度 | 价格 | 标签 |
|---------|------|------|------|------|
| 宫保鸡丁 | 川菜 | 95 | ¥38 | 辣, 下饭 |
| 麻婆豆腐 | 川菜 | 90 | ¥32 | 辣, 素食 |
| 小笼包 | 江浙菜 | 85 | ¥18 | 经典, 素食 |
| 北京烤鸭 | 京菜 | 92 | ¥128 | 烤鸭, 招牌菜 |
| ... | ... | ... | ... | ... |

### 餐厅数据

8 家示例餐厅（北京地区）：

| 店铺名称 | 距离 | 评分 | 配送费 | 配送时间 |
|---------|------|------|--------|---------|
| 川味轩 | 1.2km | 4.8 | ¥5 | 35 分钟 |
| 味蕾江南 | 5.2km | 4.7 | ¥3 | 40 分钟 |
| 老字号烤鸭店 | 2.1km | 4.9 | ¥8 | 45 分钟 |
| ... | ... | ... | ... | ... |

---

## 🔍 API 端点

### 1. 随机推荐

```
GET /recommendation/random
?latitude=39.9042&longitude=116.3554&category=川菜&max_price=50&radius=3000
```

**响应示例**：
```json
{
  "code": 0,
  "food": {
    "id": 1,
    "name": "宫保鸡丁",
    "category": "川菜",
    "avg_price": 38.00,
    "tags": ["辣", "下饭"],
    "image_url": "/images/foods/gongbao_chicken.jpg"
  },
  "nearbyRestaurants": [
    {
      "id": 1,
      "name": "川味轩",
      "distance": 1200,
      "rating": 4.8,
      "delivery_time": 35
    }
  ],
  "location": {
    "address": "北京市西城区"
  }
}
```

### 2. 推荐历史

```
GET /recommendation/history
Authorization: Bearer <JWT_TOKEN>
```

### 3. 推荐统计

```
GET /recommendation/stats
```

---

## 📱 功能特性

### 前端功能
- ✅ 自动地理定位（浏览器 Geolocation）
- ✅ 位置回退策略（拒绝时使用默认位置）
- ✅ 菜品详情展示
- ✅ 餐厅列表展示
- ✅ 多种排序方式
- ✅ 条件筛选
- ✅ 拨号功能
- ✅ 地图集成（高德地图）
- ✅ 响应式设计

### 后端功能
- ✅ 加权随机算法
- ✅ 条件筛选支持
- ✅ 地理距离计算
- ✅ 推荐历史记录
- ✅ 统计信息查询
- ✅ JWT 认证
- ✅ 错误处理

---

## 📚 文档资源

| 文档 | 说明 |
|------|------|
| `RANDOM_RECOMMENDATION_GUIDE.md` | 完整实现指南（架构、SQL、算法等） |
| `API_TEST_GUIDE.md` | API 测试指南（cURL、Postman 示例） |
| `README.md` | 项目整体说明 |

---

## 🛠️ 自定义扩展

### 1. 添加更多菜品

在 `init_foods_db.sql` 中的 INSERT 语句添加新记录：

```sql
INSERT INTO foods (name, category, image_url, avg_price, tags, popularity)
VALUES ('新菜品', '菜系', '/images/new.jpg', 35.00, '标签1,标签2', 80);
```

### 2. 添加更多餐厅

在 `restaurants` 表插入新餐厅数据：

```sql
INSERT INTO restaurants (name, address, latitude, longitude, phone, rating)
VALUES ('新餐厅', '地址', 39.9042, 116.3554, '010-xxxxxxxx', 4.8);
```

### 3. 修改推荐半径

在 `RandomSelect.vue` 中：

```javascript
radius: 5000  // 改为所需的米数
```

### 4. 调整热度权重

在 `recommendation.js` 中：

```sql
ORDER BY RAND() * (popularity / 100 + 1) DESC
         ↓ 修改权重系数
ORDER BY RAND() * (popularity / 50 + 1) DESC  // 权重更大
```

---

## 🐛 故障排查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 菜品不显示 | 数据库中无数据或表不存在 | 检查并执行 init_foods_db.sql |
| 附近餐厅为空 | restaurants 表无数据 | 确保已执行初始化脚本 |
| 地理定位失败 | 用户拒绝或浏览器不支持 | 应用使用默认位置；检查浏览器权限 |
| API 返回错误 | 参数缺失或后端异常 | 检查请求参数；查看后端日志 |
| 高德 API 调用失败 | API Key 配置错误 | 检查 amapService.js 中的 API Key |

---

## 📈 性能优化建议

1. **数据库索引**
   - 已添加 `idx_popularity` 在 foods 表
   - 已添加 `idx_location` 在 restaurants 表

2. **缓存策略**
   - 推荐结果可在前端缓存
   - 美食列表可定期更新

3. **API 优化**
   - 使用分页查询大数据集
   - 实现请求速率限制
   - 压缩响应数据

4. **前端优化**
   - 图片懒加载
   - 虚拟列表展示长列表
   - 防抖搜索/筛选操作

---

## 🔐 安全考虑

1. **SQL 注入**
   - 当前使用字符串拼接（需改进）
   - 建议升级为参数化查询

2. **认证**
   - JWT Token 用于 history 和其他敏感端点
   - 生产环境需配置安全的密钥

3. **API 限流**
   - 高德地图可能有配额限制
   - 生产环境需实现速率限制

---

## 📞 后续扩展方向

1. **个性化推荐**
   - 基于用户推荐历史的协同过滤
   - 根据用户偏好推荐菜系

2. **餐厅管理**
   - 与外卖平台接口对接
   - 实时菜单和库存更新

3. **用户反馈**
   - 推荐效果评分
   - 菜品收藏夹
   - 用户评论

4. **社交功能**
   - 美食分享
   - 用户圈子
   - 推荐排行榜

5. **数据分析**
   - 推荐热门菜品统计
   - 用户偏好分析
   - A/B 测试

---

## 📝 版本信息

- **创建日期**：2025-12-11
- **最后更新**：2025-12-11
- **版本**：v1.0.0
- **状态**：✅ 完成并可用

---

**感谢使用！** 🎉

如有问题或建议，请参考相关文档或修改源代码。
