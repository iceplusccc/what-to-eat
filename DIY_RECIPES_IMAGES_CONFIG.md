# DIY 菜谱模块图片配置

## 📸 图片文件夹

已有 34 张菜谱配图存放在 `serve/public/recipes/` 文件夹中：

```
serve/public/recipes/
├── 宫保鸡丁.jpg
├── 麻婆豆腐.jpg
├── 鱼香肉丝.jpg
├── 白切鸡.jpg
├── 蒜蓉粉丝蒸扇贝.jpg
├── 清蒸鲈鱼.jpg
├── 虾仁滑蛋.jpg
├── 番茄炒鸡蛋.jpg
├── 蒜蓉西兰花.jpg
└── ... 其他 25 张菜谱图片
```

## 🔧 配置步骤

### 1. 数据库配置（二选一）

#### 方案 A：使用更新的初始化脚本（推荐新数据库）

已在 `serve/diy_recipes.sql` 中添加了所有菜谱的 `image_url` 字段，格式为 `/recipes/菜品名.jpg`

运行初始化脚本：
```bash
mysql -u root -p123456 < serve/diy_recipes.sql
```

#### 方案 B：更新现有数据库

如果已有菜谱数据，运行更新脚本：
```bash
mysql -u root -p123456 < serve/update_diy_recipes_images.sql
```

### 2. 后端配置

后端已在 `serve/app.js` 中配置了静态文件服务：
```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

这样 `/recipes/xxx.jpg` 会自动映射到 `serve/public/recipes/xxx.jpg`

### 3. 前端配置

前端在 `src/views/DIY.vue` 中添加了 `normalizeRecipeImageUrl` 函数：
```javascript
const normalizeRecipeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${backendBase}${url}`  // 添加 http://127.0.0.1:5000 前缀
}
```

在加载菜谱列表和详情时调用此函数进行规范化：

**菜谱列表加载：**
```javascript
recipes.value = (res.data || []).map(recipe => ({
  ...recipe,
  image_url: normalizeRecipeImageUrl(recipe.image_url)
}))
```

**菜谱详情加载：**
```javascript
selectedRecipe.value = {
  ...res.data,
  image_url: normalizeRecipeImageUrl(res.data.image_url)
}
```

## 📊 DIY 菜谱数据

| 菜品名 | 菜系 | 难度 | 图片文件 |
|--------|------|------|---------|
| 宫保鸡丁 | 川菜 | 中等 | 宫保鸡丁.jpg |
| 麻婆豆腐 | 川菜 | 简单 | 麻婆豆腐.jpg |
| 鱼香肉丝 | 川菜 | 中等 | 鱼香肉丝.jpg |
| 清汤白切鸡 | 粤菜 | 简单 | 白切鸡.jpg |
| 蒜蓉蒸虾 | 粤菜 | 简单 | 蒜蓉粉丝蒸扇贝.jpg |
| 西湖醋鱼 | 浙菜 | 中等 | 清蒸鲈鱼.jpg |
| 龙井虾仁 | 浙菜 | 中等 | 虾仁滑蛋.jpg |
| 番茄鸡蛋面 | 家常菜 | 简单 | 番茄炒鸡蛋.jpg |
| 清炒空心菜 | 家常菜 | 简单 | 蒜蓉西兰花.jpg |

## 🖼️ 图片 URL 映射

| 数据库字段值 | 实际文件位置 | 前端访问 URL |
|-------------|-----------|-----------|
| `/recipes/菜品名.jpg` | `serve/public/recipes/菜品名.jpg` | `http://127.0.0.1:5000/recipes/菜品名.jpg` |

## 🎯 前端图片使用

在 DIY.vue 中，菜品图片使用 `<img>` 标签显示：

**菜谱卡片：**
```vue
<img :src="recipe.image_url || '/images/default-recipe.jpg'" :alt="recipe.name" class="recipe-image" />
```

**菜谱详情：**
```vue
<img :src="selectedRecipe.image_url || '/images/default-recipe.jpg'" :alt="selectedRecipe.name" />
```

图片 URL 已通过 `normalizeRecipeImageUrl()` 规范化为完整的 HTTP 绝对路径。

## ➕ 添加新菜谱

如果要添加新菜谱，步骤如下：

1. 将菜品图片放入 `serve/public/recipes/`，命名为 `菜品名.jpg`
2. 在数据库插入新菜谱记录，`image_url` 设置为 `/recipes/菜品名.jpg`

```sql
INSERT INTO recipes (name, category, difficulty, prep_time, cook_time, servings, image_url, description, ingredients, instructions, tips) 
VALUES ('新菜品', '菜系', '难度', 时间, 时间, 份数, '/recipes/新菜品.jpg', '描述', '食材JSON', '步骤', '贴士');
```

## 🚀 部署注意事项

- 确保 `serve/public/recipes/` 文件夹与其他文件一起部署
- 建议使用 CDN 加速菜谱图片加载
- 确保服务器有适当的文件权限（至少读权限）
- 如果使用不同的后端域名，需要修改 `backendBase` 变量

## ❓ 常见问题

**Q: 菜品图片显示不出来？**

A: 检查以下几项：
1. 数据库 `image_url` 字段是否正确为 `/recipes/菜品名.jpg`
2. 图片文件是否存在于 `serve/public/recipes/`
3. 后端服务是否正常运行
4. 浏览器开发者工具 Network 标签中检查图片请求 URL 是否正确

**Q: 菜品图片返回 404？**

A: 可能原因：
- 文件名与数据库记录不一致
- 文件编码问题（确保 JPG 文件名使用 UTF-8 编码）
- 后端服务未启动或重启需要

**Q: 某些菜谱没有图片？**

A: 
- 检查 `recipes` 表中该菜谱的 `image_url` 是否为 NULL
- 确认对应的图片文件是否存在
- 更新数据库记录添加 `image_url` 值

