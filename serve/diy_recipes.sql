-- DIY 菜谱数据库初始化脚本

-- 创建菜谱表
CREATE TABLE IF NOT EXISTS recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '菜名',
  category VARCHAR(50) NOT NULL COMMENT '菜系：川菜、粤菜、浙菜等',
  difficulty VARCHAR(20) DEFAULT '中等' COMMENT '难度：简单、中等、困难',
  prep_time INT COMMENT '准备时间（分钟）',
  cook_time INT COMMENT '烹饪时间（分钟）',
  servings INT DEFAULT 2 COMMENT '份数',
  image_url VARCHAR(255) COMMENT '菜品图片URL',
  description TEXT COMMENT '菜品描述',
  ingredients TEXT NOT NULL COMMENT '食材（JSON格式或文本）',
  instructions TEXT NOT NULL COMMENT '烹饪步骤',
  tips TEXT COMMENT '小贴士',
  calories INT COMMENT '热量（每100g）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL COMMENT '用户ID',
  recipe_id INT NOT NULL COMMENT '菜谱ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (account_id, recipe_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  INDEX idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入示例菜谱数据
INSERT INTO recipes (name, category, difficulty, prep_time, cook_time, servings, image_url, description, ingredients, instructions, tips) VALUES

-- 川菜系列
('宫保鸡丁', '川菜', '中等', 15, 15, 2, '/recipes/宫保鸡丁.jpg', '一道经典川菜，以花生和辣椒的香味与鸡丁的嫩滑相融合', 
 '[{"item":"鸡肉", "amount":"300g"},{"item":"花生", "amount":"100g"},{"item":"干红辣椒", "amount":"6个"},{"item":"葱", "amount":"2根"},{"item":"姜", "amount":"1小块"},{"item":"酱油", "amount":"2汤匙"},{"item":"糖", "amount":"1汤匙"},{"item":"醋", "amount":"1汤匙"}]',
 '1.鸡肉切丁，用盐和淀粉腌制10分钟。2.干红辣椒去籽切段，葱姜切末。3.热油下鸡丁炒至变白。4.加入干辣椒、花生翻炒。5.加入酱油、糖、醋调味。6.炒匀出锅。',
 '鸡肉要腌制入味，火候要快，保证口感嫩滑。'),

('麻婆豆腐', '川菜', '简单', 10, 15, 3, '/recipes/麻婆豆腐.jpg', '四川传统名菜，豆腐嫩滑，麻辣味浓', 
 '[{"item":"豆腐", "amount":"300g"},{"item":"牛肉末", "amount":"150g"},{"item":"豆瓣酱", "amount":"2汤匙"},{"item":"花椒", "amount":"1汤匙"},{"item":"辣椒油", "amount":"2汤匙"},{"item":"大蒜", "amount":"3瓣"},{"item":"生抽", "amount":"2汤匙"}]',
 '1.豆腐切块，轻轻焯水沥干。2.热油爆香豆瓣酱和大蒜。3.加入牛肉末炒香。4.倒入清汤烧开，加豆腐。5.加生抽、花椒、辣椒油调味。6.小火焖2分钟出锅。',
 '豆腐要轻轻处理，避免碎裂。汤汁要浓郁。'),

('鱼香肉丝', '川菜', '中等', 20, 20, 2, '/recipes/鱼香肉丝.jpg', '川菜名菜，酸酸辣辣的味道很开胃', 
 '[{"item":"猪肉", "amount":"300g"},{"item":"青椒", "amount":"1个"},{"item":"红椒", "amount":"1个"},{"item":"木耳", "amount":"50g"},{"item":"豆瓣酱", "amount":"2汤匙"},{"item":"醋", "amount":"2汤匙"},{"item":"糖", "amount":"1汤匙"},{"item":"生抽", "amount":"2汤匙"}]',
 '1.猪肉切丝，用盐和淀粉腌制。2.青红椒切丝，木耳切丝。3.热油下肉丝炒至变色。4.加豆瓣酱炒香。5.加入青红椒和木耳翻炒。6.用醋、糖、生抽调成鱼香汁，淋入炒匀。',
 '火要猛，快速翻炒保留蔬菜的脆度。'),

-- 粤菜系列
('清汤白切鸡', '粤菜', '简单', 10, 30, 4, '/recipes/白切鸡.jpg', '粤菜经典，清汤鲜香，鸡肉嫩滑',
 '[{"item":"整只鸡", "amount":"1.5kg"},{"item":"葱", "amount":"3根"},{"item":"姜", "amount":"5片"},{"item":"盐", "amount":"适量"},{"item":"植物油", "amount":"3汤匙"}]',
 '1.将鸡洗净，放入沸水中煮25-30分钟。2.用筷子扎入大腿根部，无血水即熟。3.取出放冰水中冷却，沥干。4.斩成块盛盘。5.生抽、醋、葱油蘸食。',
 '火候要足但不过头，肉质才嫩。'),

('蒜蓉蒸虾', '粤菜', '简单', 10, 8, 2, '/recipes/蒜蓉粉丝蒸扇贝.jpg', '清淡鲜美，虾肉饱满',
 '[{"item":"大虾", "amount":"400g"},{"item":"大蒜", "amount":"5瓣"},{"item":"豉油", "amount":"2汤匙"},{"item":"油", "amount":"3汤匙"},{"item":"葱", "amount":"1根"}]',
 '1.虾洗净沥干，放蒸盘上。2.大蒜切末。3.热油爆香蒜末，加豉油。4.将蒜油淋在虾上。5.蒸锅水烧开，放入蒸8分钟即可。6.撒葱段出锅。',
 '蒸的时间不要过长，虾易老。'),

-- 浙菜系列
('西湖醋鱼', '浙菜', '中等', 15, 20, 2, '/recipes/清蒸鲈鱼.jpg', '浙江名菜，酸酸甜甜，鱼肉鲜美',
 '[{"item":"草鱼", "amount":"600g"},{"item":"醋", "amount":"3汤匙"},{"item":"糖", "amount":"2汤匙"},{"item":"姜", "amount":"3片"},{"item":"葱", "amount":"2根"},{"item":"生抽", "amount":"1汤匙"}]',
 '1.鱼洗净，两面划几刀。2.油热下鱼炸至两面金黄。3.另起锅，下姜葱爆香。4.加入醋、糖、生抽和清汤烧开。5.倒汁淋在鱼上，焖2分钟。6.撒葱末出锅。',
 '鱼要选新鲜的，火候要快，味道要甜酸适中。'),

('龙井虾仁', '浙菜', '中等', 15, 10, 2, '/recipes/虾仁滑蛋.jpg', '清淡优雅，虾仁鲜美，茶香浓郁',
 '[{"item":"虾仁", "amount":"300g"},{"item":"龙井茶叶", "amount":"5g"},{"item":"料酒", "amount":"1汤匙"},{"item":"淀粉", "amount":"1汤匙"},{"item":"葱", "amount":"2根"}]',
 '1.虾仁洗净，用料酒和淀粉腌制。2.龙井茶用温水泡软，茶水留用。3.热油下虾仁炒至半熟。4.加入龙井茶叶和茶水，翻炒均匀。5.约1分钟即可出锅。6.撒葱段。',
 '龙井茶不要用太热的水泡，要保留茶香。'),

-- 家常菜系列
('番茄鸡蛋面', '家常菜', '简单', 5, 15, 1, '/recipes/番茄炒鸡蛋.jpg', '快手面食，酸酸的番茄味很开胃',
 '[{"item":"面条", "amount":"100g"},{"item":"番茄", "amount":"2个"},{"item":"鸡蛋", "amount":"1个"},{"item":"葱", "amount":"1根"},{"item":"盐", "amount":"适量"},{"item":"油", "amount":"1汤匙"}]',
 '1.番茄切块，鸡蛋打散。2.热油下番茄块炒出汁。3.加水烧开，下面条煮至8分熟。4.倒入蛋花，轻轻搅散。5.加盐调味。6.撒葱末出锅。',
 '鸡蛋要慢慢倒入，保持漂亮的蛋花。'),

('清炒空心菜', '家常菜', '简单', 5, 5, 2, '/recipes/蒜蓉西兰花.jpg', '简单快手菜，清爽健康',
 '[{"item":"空心菜", "amount":"300g"},{"item":"大蒜", "amount":"3瓣"},{"item":"生抽", "amount":"1汤匙"},{"item":"油", "amount":"2汤匙"}]',
 '1.空心菜洗净沥干，去掉老茎。2.大蒜切末。3.热油爆香蒜末。4.下空心菜大火炒，约2分钟。5.加生抽调味，翻炒均匀。6.出锅。',
 '火要猛，时间要快，这样菜才爽脆。');
