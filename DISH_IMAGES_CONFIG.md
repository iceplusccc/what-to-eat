# 菜品图片配置说明

## 文件夹结构

```
serve/
├── public/
│   └── dishes/              # 菜品图片文件夹
│       ├── 宫保鸡丁.png
│       ├── 麻婆豆腐.png
│       ├── 鱼香肉丝.png
│       ├── 北京烤鸭.png
│       ├── 小笼包.png
│       └── ... 其他菜品图片
│   └── upload/              # 用户上传文件夹（头像等）
│       ├── portrait.jpg     # 默认头像
│       └── ... 其他上传文件
```

## 配置步骤

### 1. 数据库配置（二选一）

#### 方案 A：使用初始化脚本（推荐）

已更新的 `init_foods_db.sql` 中，所有菜品的 `image_url` 都设置为：
```sql
/dishes/菜品名.png
```

运行初始化脚本：
```bash
mysql -u root -p123456 < serve/init_foods_db.sql
```

#### 方案 B：更新现有数据库

如果已有数据库，运行更新脚本：
```bash
mysql -u root -p123456 < serve/update_dish_images.sql
```

### 2. 后端配置

后端已在 `serve/app.js` 中配置了静态文件服务：
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

这样 `/dishes/xxx.png` 会自动映射到 `serve/public/dishes/xxx.png`

### 3. 前端配置

前端在 `src/views/RandomSelect.vue` 中添加了 `normalizeImageUrl` 函数：
```javascript
const normalizeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${backendBase}${url}`  // 添加 http://127.0.0.1:5000 前缀
}
```

在 `getRandomRecommendation` 中调用此函数：
```javascript
if (res.food && res.food.image_url) {
  res.food.image_url = normalizeImageUrl(res.food.image_url)
}
```

## 图片路径说明

| 来源 | 数据库存储路径 | 前端展示 URL |
|------|----------------|-----------|
| dishes 文件夹 | `/dishes/菜品名.png` | `http://127.0.0.1:5000/dishes/菜品名.png` |
| 用户上传头像 | `/upload/xxx.png` | `http://127.0.0.1:5000/upload/xxx.png` |

## 添加新菜品

1. 在 `serve/public/dishes/` 中放入新菜品图片，命名为 `菜品名.png`
2. 在数据库插入新菜品记录，`image_url` 设置为 `/dishes/菜品名.png`

```sql
INSERT INTO foods (name, category, sub_category, image_url, description, avg_price, tags, popularity) 
VALUES ('新菜品', '菜系', '分类', '/dishes/新菜品.png', '描述', 价格, '标签', 热度);
```

## 生产环境配置

- 将 `serve/public/dishes/` 文件夹与其他文件一起部署到服务器
- 确保 dishes 文件夹有读权限
- 建议使用 CDN 来加速图片加载

## 故障排查

### 菜品图片显示为空

1. 检查 `serve/public/dishes/` 文件夹是否存在
2. 检查图片文件名是否与数据库记录一致（区分大小写）
3. 检查后端服务是否正常运行在 `http://127.0.0.1:5000`
4. 在浏览器开发者工具 Network 标签中检查图片 URL 是否正确

### 图片 404 错误

- 检查文件名编码（确保 PNG 文件名使用 UTF-8）
- 确认文件在正确的位置：`serve/public/dishes/`
- 重启后端服务

