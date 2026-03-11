-- 初始化美食推荐数据库表
USE what_to_eat;

-- 1. 创建 foods 表（美食菜品表）
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '菜品ID',
    name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    category VARCHAR(50) NOT NULL COMMENT '菜系（如川菜、粤菜、浙菜等）',
    sub_category VARCHAR(50) COMMENT '子分类（如主菜、小吃、汤品等）',
    image_url VARCHAR(500) COMMENT '菜品图片地址',
    description VARCHAR(500) COMMENT '菜品描述',
    avg_price DECIMAL(8, 2) COMMENT '平均价格',
    tags VARCHAR(200) COMMENT '标签（逗号分隔，如辣、素食、清淡等）',
    popularity INT DEFAULT 50 COMMENT '热度值，用于加权随机（1-100）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_popularity (popularity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='美食菜品表';

-- 2. 创建 restaurants 表（餐厅店铺表）
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '店铺ID',
    name VARCHAR(100) NOT NULL COMMENT '店铺名称',
    address VARCHAR(500) NOT NULL COMMENT '详细地址',
    latitude DECIMAL(10, 6) NOT NULL COMMENT '纬度',
    longitude DECIMAL(10, 6) NOT NULL COMMENT '经度',
    phone VARCHAR(20) COMMENT '店铺电话',
    rating DECIMAL(3, 1) DEFAULT 5.0 COMMENT '评分（0-5）',
    delivery_fee DECIMAL(8, 2) DEFAULT 0 COMMENT '配送费',
    min_order DECIMAL(8, 2) DEFAULT 0 COMMENT '起送价',
    delivery_time INT DEFAULT 30 COMMENT '预计配送时间（分钟）',
    opening_hours VARCHAR(100) COMMENT '营业时间',
    image_url VARCHAR(500) COMMENT '店铺图片',
    status ENUM('open', 'closed', 'pause') DEFAULT 'open' COMMENT '营业状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_location (latitude, longitude),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='餐厅店铺表';

-- 3. 创建 recommendation_history 表（推荐历史表）
CREATE TABLE IF NOT EXISTS recommendation_history (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    account_id INT NOT NULL COMMENT '账户ID',
    food_id INT NOT NULL COMMENT '菜品ID',
    latitude DECIMAL(10, 6) COMMENT '推荐时的用户纬度',
    longitude DECIMAL(10, 6) COMMENT '推荐时的用户经度',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '推荐时间',
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (food_id) REFERENCES foods(id),
    INDEX idx_account_id (account_id),
    INDEX idx_food_id (food_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推荐历史表';

-- 4. 插入示例美食数据（15条）
-- 图片路径：/dishes/菜品名.png （存储在 serve/public/dishes 目录）
INSERT INTO foods (name, category, sub_category, image_url, description, avg_price, tags, popularity) VALUES
('宫保鸡丁', '川菜', '主菜', '/dishes/宫保鸡丁.png', '经典川菜，花生和鸡丁的完美组合，麻辣鲜香', 38.00, '辣,下饭', 95),
('麻婆豆腐', '川菜', '主菜', '/dishes/麻婆豆腐.png', '软嫩豆腐配上麻辣豉油汁，风味独特', 32.00, '辣,素食,下饭', 90),
('鱼香肉丝', '川菜', '主菜', '/dishes/鱼香肉丝.png', '鲜香麻辣，鱼肉鲜嫩爽滑', 48.00, '辣,海鲜,下饭', 88),
('北京烤鸭', '京菜', '主菜', '/dishes/北京烤鸭.png', '传统工艺烤制，皮脆肉嫩，色泽金红', 128.00, '烤鸭,招牌菜', 92),
('小笼包', '江浙菜', '小吃', '/dishes/小笼包.png', '薄皮大馅，汤汁丰富，口感鲜美', 18.00, '经典,素食', 85),
('红烧肉', '浙菜', '主菜', '/dishes/红烧肉.png', '肥而不腻，入口即化，甜咸适中', 36.00, '下饭,家常菜', 80),
('清蒸鲈鱼', '粤菜', '主菜', '/dishes/清蒸鲈鱼.png', '鲜嫩鱼肉，清淡养生，清蒸原汁原味', 58.00, '清淡,海鲜,健康', 82),
('西红柿炒鸡蛋', '家常菜', '甜品', '/dishes/西红柿炒鸡蛋.png', '外脆内软，金黄焦香，入口即化', 22.00, '甜品,素食,下午茶', 78),
('酸菜鱼', '川菜', '主菜', '/dishes/酸菜鱼.png', '酸爽开胃，鱼肉细嫩，汤底浓郁', 42.00, '辣,酸,开胃', 87),
('东坡肉', '浙菜', '主菜', '/dishes/东坡肉.png', '红烧肉的升级版，入口即化，肥而不腻', 44.00, '肉类,下饭,招牌', 83),
('毛血旺', '川菜', '主菜', '/dishes/毛血旺.png', '麻辣十足，食材丰富，江湖菜经典', 36.00, '辣,内脏,重口味', 76),
('虾饺', '中式', '小吃', '/dishes/虾饺.png', '外脆内嫩，馅料丰富，手工制作', 12.00, '小吃,素食,油炸', 74),
('辣子鸡', '川菜', '主菜', '/dishes/辣子鸡.png', '外焦里嫩，配菜丰富，家聚必点', 56.00, '辣,蛙肉,聚餐菜', 84),
('糖醋排骨', '川菜', '主菜', '/dishes/糖醋排骨.png', '色泽红亮，酸辣适中，下饭一绝', 28.00, '辣,下饭,经典', 86),
('白切鸡', '粤菜', '主菜', '/dishes/白切鸡.png', '鲜香滑嫩，蛋液细腻，汤汁鲜美', 34.00, '海鲜,清淡,下饭', 79);

-- 5. 插入示例店铺数据（8家）
INSERT INTO restaurants (name, address, latitude, longitude, phone, rating, delivery_fee, min_order, delivery_time, opening_hours, image_url, status) VALUES
('川味轩', '西城区复兴门内大街1号', 39.9042, 116.3554, '010-66095588', 4.8, 5.00, 30.00, 35, '10:00-22:00', '/images/shops/chuanwei.jpg', 'open'),
('味蕾江南', '东城区建国路1号', 39.9075, 116.4074, '010-87718888', 4.7, 3.00, 25.00, 40, '11:00-23:00', '/images/shops/weilei.jpg', 'open'),
('家常菜馆', '朝阳区三里屯路19号', 39.9510, 116.4600, '010-52826868', 4.6, 4.00, 20.00, 32, '09:30-21:30', '/images/shops/jiachang.jpg', 'open'),
('麻辣诱惑', '海淀区中关村大街1号', 39.9865, 116.3092, '010-62561234', 4.5, 6.00, 35.00, 38, '10:30-22:30', '/images/shops/malayouhuo.jpg', 'open'),
('老字号烤鸭店', '东城区王府井大街100号', 39.9134, 116.4109, '010-65258888', 4.9, 8.00, 50.00, 45, '11:00-21:00', '/images/shops/laozihao.jpg', 'open'),
('鲜鱼坊', '朝阳区建国路88号', 39.9048, 116.4679, '010-67726666', 4.7, 5.00, 28.00, 35, '10:00-22:00', '/images/shops/xianyufang.jpg', 'open'),
('粤菜老食堂', '东城区崇文门外大街22号', 39.8865, 116.4268, '010-63581234', 4.6, 4.00, 22.00, 38, '11:00-21:30', '/images/shops/canteen.jpg', 'open'),
('浙菜园', '朝阳区朝阳门外大街12号', 39.9254, 116.4391, '010-85906666', 4.8, 5.00, 30.00, 36, '10:30-22:00', '/images/shops/zhejiang.jpg', 'open');

-- 创建视图：食物-店铺关联（方便按距离和菜系筛选）
CREATE OR REPLACE VIEW food_restaurant_distance AS
SELECT 
    f.id as food_id,
    f.name as food_name,
    f.category,
    f.avg_price,
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.address,
    r.latitude,
    r.longitude,
    r.rating,
    r.delivery_fee,
    r.delivery_time,
    r.status
FROM foods f
CROSS JOIN restaurants r
WHERE r.status = 'open';
