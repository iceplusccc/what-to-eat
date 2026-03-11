-- 更新菜品图片路径为 dishes 文件夹中的图片
-- 使用路径：/upload/dishes/菜品名.png

USE what_to_eat;

-- 更新所有菜品的图片路径
UPDATE foods SET image_url = CONCAT('/dishes/', name, '.png');

-- 验证更新结果
SELECT id, name, image_url FROM foods ORDER BY id;
