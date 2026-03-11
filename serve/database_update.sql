-- 数据库字段更新脚本
-- 为 accounts 表添加用户信息字段

USE what_to_eat;

-- 添加性别字段
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT '保密' COMMENT '性别';

-- 添加邮箱字段
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS email VARCHAR(100) DEFAULT NULL COMMENT '电子邮箱';

-- 添加手机号字段
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS phone VARCHAR(11) DEFAULT NULL COMMENT '手机号';

-- 查看表结构
DESC accounts;

-- 如果上面的 IF NOT EXISTS 不支持，使用下面的语句：
-- ALTER TABLE accounts ADD COLUMN gender VARCHAR(10) DEFAULT '保密' COMMENT '性别';
-- ALTER TABLE accounts ADD COLUMN email VARCHAR(100) DEFAULT NULL COMMENT '电子邮箱';
-- ALTER TABLE accounts ADD COLUMN phone VARCHAR(11) DEFAULT NULL COMMENT '手机号';
