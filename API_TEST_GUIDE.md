# 随机美食推荐 API 测试指南

## 📍 API 端点列表

### 1. 获取随机推荐 (GET /recommendation/random)

**描述**：获取随机推荐的菜品和附近餐厅

**URL**: `http://127.0.0.1:5000/recommendation/random`

**请求方法**: GET

**查询参数**:

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| latitude | number | ✅ | 用户纬度 | 39.9042 |
| longitude | number | ✅ | 用户经度 | 116.3554 |
| category | string | ❌ | 菜系筛选 | 川菜 |
| max_price | number | ❌ | 价格上限 | 50 |
| radius | number | ❌ | 搜索半径(米) | 3000 |

### 2. 获取推荐历史 (GET /recommendation/history)

**描述**：获取当前用户的推荐历史记录

**URL**: `http://127.0.0.1:5000/recommendation/history`

**请求方法**: GET

**认证**: 需要 JWT Token（Authorization 头）

**查询参数**: 无

### 3. 获取推荐统计 (GET /recommendation/stats)

**描述**：获取推荐功能的统计信息

**URL**: `http://127.0.0.1:5000/recommendation/stats`

**请求方法**: GET

**查询参数**: 无

---

## 🧪 测试示例

### 使用 cURL 测试

#### 1. 测试随机推荐（无筛选条件）

```bash
curl -X GET "http://127.0.0.1:5000/recommendation/random?latitude=39.9042&longitude=116.3554"
```

#### 2. 测试随机推荐（带菜系筛选）

```bash
curl -X GET "http://127.0.0.1:5000/recommendation/random?latitude=39.9042&longitude=116.3554&category=川菜"
```

#### 3. 测试随机推荐（带价格筛选）

```bash
curl -X GET "http://127.0.0.1:5000/recommendation/random?latitude=39.9042&longitude=116.3554&max_price=50"
```

#### 4. 测试随机推荐（综合筛选）

```bash
curl -X GET "http://127.0.0.1:5000/recommendation/random?latitude=39.9042&longitude=116.3554&category=川菜&max_price=60&radius=5000"
```

#### 5. 测试推荐统计

```bash
curl -X GET "http://127.0.0.1:5000/recommendation/stats"
```

#### 6. 测试推荐历史（需要认证）

```bash
# 先获取 token（登录）
curl -X POST "http://127.0.0.1:5000/login/checklogin" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "account=testuser&password=testpass"

# 使用返回的 token 获取历史
curl -X GET "http://127.0.0.1:5000/recommendation/history" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔍 使用 Postman 测试

### 设置环境变量

在 Postman 中新建环境，添加以下变量：

```
{
  "baseUrl": "http://127.0.0.1:5000",
  "latitude": "39.9042",
  "longitude": "116.3554",
  "token": "YOUR_JWT_TOKEN"
}
```

### 创建测试请求集合

#### 请求 1: 随机推荐（默认）

```
GET {{baseUrl}}/recommendation/random?latitude={{latitude}}&longitude={{longitude}}
```

**预期响应码**: 200

**预期响应体**:
```json
{
  "code": 0,
  "reason": "推荐成功",
  "food": {
    "id": 1,
    "name": "宫保鸡丁",
    "category": "川菜",
    "avg_price": 38.00
  },
  "nearbyRestaurants": [...]
}
```

#### 请求 2: 随机推荐（川菜，价格≤50）

```
GET {{baseUrl}}/recommendation/random?latitude={{latitude}}&longitude={{longitude}}&category=川菜&max_price=50
```

#### 请求 3: 推荐统计

```
GET {{baseUrl}}/recommendation/stats
```

**预期响应体**:
```json
{
  "code": 0,
  "data": {
    "total_foods": 15,
    "total_restaurants": 8,
    "total_recommendations": 42,
    "categories_count": 7
  }
}
```

#### 请求 4: 推荐历史

```
GET {{baseUrl}}/recommendation/history
Authorization: Bearer {{token}}
```

---

## 📊 响应数据格式详解

### 随机推荐响应示例

```json
{
  "code": 0,
  "reason": "推荐成功",
  "food": {
    "id": 1,
    "name": "宫保鸡丁",
    "category": "川菜",
    "sub_category": "主菜",
    "image_url": "/images/foods/gongbao_chicken.jpg",
    "description": "经典川菜，花生和鸡丁的完美组合，麻辣鲜香",
    "avg_price": 38.00,
    "tags": ["辣", "下饭"],
    "popularity": 95
  },
  "nearbyRestaurants": [
    {
      "id": 1,
      "name": "川味轩",
      "address": "西城区复兴门内大街1号",
      "latitude": 39.9042,
      "longitude": 116.3554,
      "distance": 1200,
      "rating": 4.8,
      "delivery_fee": 5.00,
      "min_order": 30.00,
      "delivery_time": 35,
      "phone": "010-66095588",
      "opening_hours": "10:00-22:00",
      "status": "open"
    },
    {
      "id": 2,
      "name": "味蕾江南",
      "address": "东城区建国路1号",
      "latitude": 39.9075,
      "longitude": 116.4074,
      "distance": 5200,
      "rating": 4.7,
      "delivery_fee": 3.00,
      "min_order": 25.00,
      "delivery_time": 40,
      "phone": "010-87718888",
      "opening_hours": "11:00-23:00",
      "status": "open"
    }
  ],
  "location": {
    "latitude": 39.9042,
    "longitude": 116.3554,
    "address": "北京市西城区"
  },
  "timestamp": "2025-12-11T10:30:00.000Z"
}
```

### 错误响应示例

```json
{
  "code": 1,
  "reason": "缺少位置信息（latitude/longitude）"
}
```

---

## 🔄 完整测试流程

### 场景 1: 用户点击"随便吃点吧"

1. **前端获取用户位置**
   ```javascript
   navigator.geolocation.getCurrentPosition(position => {
       const {latitude, longitude} = position.coords;
       // 调用 API
   });
   ```

2. **前端发送推荐请求**
   ```bash
   GET /recommendation/random?latitude=39.9042&longitude=116.3554
   ```

3. **后端处理**
   - 验证参数
   - 从 foods 表随机选菜
   - 查询附近餐厅
   - 返回组合数据

4. **前端渲染**
   - 显示菜品信息
   - 显示餐厅列表
   - 提供交互按钮

### 场景 2: 用户应用筛选条件

1. **用户选择筛选条件**
   - 菜系：川菜
   - 价格：¥20-50
   - 半径：3km

2. **前端发送带条件的请求**
   ```bash
   GET /recommendation/random?latitude=39.9042&longitude=116.3554&category=川菜&max_price=50&radius=3000
   ```

3. **后端处理**
   - WHERE category='川菜' AND avg_price <= 50
   - 查询距离用户 3000 米以内的餐厅
   - 返回结果

### 场景 3: 用户点击"换一个"按钮

1. **前端重新发送相同请求**（可能带条件）

2. **后端每次都执行加权随机**
   - 相同条件下仍可能得到不同菜品（随机）

3. **推荐历史记录**
   - 每次推荐都被记录在 recommendation_history 表中

---

## ✅ 测试检查清单

- [ ] 能否获取随机推荐（无条件）
- [ ] 能否按菜系筛选
- [ ] 能否按价格筛选
- [ ] 能否按距离排序
- [ ] 能否查看推荐统计
- [ ] 能否获取推荐历史
- [ ] 返回的距离值是否合理
- [ ] 返回的菜品图片是否正确
- [ ] 返回的餐厅电话是否有效
- [ ] 位置地址是否正确解析

---

## 🐛 常见错误代码

| 错误代码 | 说明 | 解决方案 |
|---------|------|---------|
| 400 | 缺少必需参数 | 检查是否提供了 latitude 和 longitude |
| 401 | 认证失败 | 对于需要认证的端点，检查 Token 是否正确 |
| 500 | 服务器错误 | 检查后端日志，确认数据库连接正常 |
| 1 | 自定义错误 | 查看 reason 字段了解具体原因 |

---

## 📝 注意事项

1. **CORS 问题**：确保后端已配置 CORS，前端才能正常调用
2. **时区问题**：推荐时间戳采用 UTC 格式，前端需要转换为本地时区
3. **缓存问题**：如数据更新但前端仍显示旧数据，尝试清除浏览器缓存
4. **速率限制**：高德地图 API 可能有配额限制，生产环境需注意调用频率

---

**最后更新**: 2025-12-11
