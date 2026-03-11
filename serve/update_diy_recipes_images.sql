-- 更新 DIY 菜谱表的图片路径
-- 使用 serve/public/recipes 文件夹中的图片

UPDATE recipes SET image_url = '/recipes/宫保鸡丁.jpg' WHERE name = '宫保鸡丁';
UPDATE recipes SET image_url = '/recipes/麻婆豆腐.jpg' WHERE name = '麻婆豆腐';
UPDATE recipes SET image_url = '/recipes/鱼香肉丝.jpg' WHERE name = '鱼香肉丝';
UPDATE recipes SET image_url = '/recipes/白切鸡.jpg' WHERE name = '清汤白切鸡';
UPDATE recipes SET image_url = '/recipes/蒜蓉粉丝蒸扇贝.jpg' WHERE name = '蒜蓉蒸虾';
UPDATE recipes SET image_url = '/recipes/清蒸鲈鱼.jpg' WHERE name = '西湖醋鱼';
UPDATE recipes SET image_url = '/recipes/虾仁滑蛋.jpg' WHERE name = '龙井虾仁';
UPDATE recipes SET image_url = '/recipes/番茄炒鸡蛋.jpg' WHERE name = '番茄鸡蛋面';
UPDATE recipes SET image_url = '/recipes/蒜蓉西兰花.jpg' WHERE name = '清炒空心菜';
