/**
 * DIY 菜谱管理路由
 */

const express = require('express');
const router = express.Router();
const connection = require('./js/mysql');
const jwt = require('express-jwt');

const SECRET = 'itsource';

// JWT 中间件
const jwtMiddleware = jwt({ 
    secret: SECRET,
    credentialsRequired: false
}).unless({
    path: ['/diy/recipes', '/diy/categories', '/diy/search']
});

router.use(jwtMiddleware);

// CORS 处理
router.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "authorization, content-type");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

/**
 * GET /diy/categories
 * 获取所有菜系分类
 */
router.get('/categories', (req, res) => {
    const query = `SELECT DISTINCT category FROM recipes ORDER BY category`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('获取菜系分类失败:', err);
            return res.send({ code: 1, reason: '获取分类失败' });
        }
        res.send({
            code: 0,
            data: (results || []).map(r => r.category)
        });
    });
});

/**
 * GET /diy/recipes
 * 获取菜谱列表（支持分类和关键词搜索）
 * 查询参数：
 * - category: 菜系（可选）
 * - keyword: 搜索关键词（可选）
 * - page: 页码（默认1）
 * - pageSize: 每页条数（默认10）
 */
router.get('/recipes', (req, res) => {
    const { category, keyword, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    const isFavorite = req.user ? true : false;

    let query = 'SELECT * FROM recipes WHERE 1=1';
    const params = [];

    if (category && category !== '全部') {
        query += ' AND category = ?';
        params.push(category);
    }

    if (keyword) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        const kw = `%${keyword}%`;
        params.push(kw, kw);
    }

    // 获取总数
    const countQuery = query.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
    connection.query(countQuery, params, (err, countResults) => {
        if (err) {
            console.error('查询菜谱总数失败:', err);
            return res.send({ code: 1, reason: '查询失败' });
        }

        const total = countResults[0]?.total || 0;
        const finalQuery = query + ` ORDER BY id LIMIT ${offset}, ${pageSize}`;

        connection.query(finalQuery, params, async (err, results) => {
            if (err) {
                console.error('查询菜谱列表失败:', err);
                return res.send({ code: 1, reason: '查询失败' });
            }

            // 如果用户已登录，查询每个菜谱是否被收藏
            if (isFavorite && req.user && req.user.id) {
                const recipeIds = (results || []).map(r => r.id);
                if (recipeIds.length > 0) {
                    const favQuery = `SELECT recipe_id FROM favorites WHERE account_id = ? AND recipe_id IN (${recipeIds.join(',')})`;
                    connection.query(favQuery, [req.user.id], (err2, favResults) => {
                        const favSet = new Set((favResults || []).map(f => f.recipe_id));
                        const enriched = (results || []).map(r => ({
                            ...r,
                            isFavorited: favSet.has(r.id)
                        }));
                        return res.send({
                            code: 0,
                            data: enriched,
                            total,
                            page: parseInt(page),
                            pageSize: parseInt(pageSize)
                        });
                    });
                } else {
                    return res.send({
                        code: 0,
                        data: results || [],
                        total,
                        page: parseInt(page),
                        pageSize: parseInt(pageSize)
                    });
                }
            } else {
                return res.send({
                    code: 0,
                    data: (results || []).map(r => ({ ...r, isFavorited: false })),
                    total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize)
                });
            }
        });
    });
});

/**
 * GET /diy/search
 * 搜索菜谱（快速搜索）
 */
router.get('/search', (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.send({ code: 1, reason: '搜索关键词不能为空' });
    }

    const query = `SELECT * FROM recipes WHERE name LIKE ? OR description LIKE ? LIMIT 20`;
    const kw = `%${keyword}%`;
    connection.query(query, [kw, kw], (err, results) => {
        if (err) {
            console.error('搜索菜谱失败:', err);
            return res.send({ code: 1, reason: '搜索失败' });
        }
        res.send({
            code: 0,
            data: results || []
        });
    });
});

/**
 * GET /diy/recipe/:id
 * 获取单个菜谱详情
 */
router.get('/recipe/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM recipes WHERE id = ? LIMIT 1`;
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('查询菜谱详情失败:', err);
            return res.send({ code: 1, reason: '查询失败' });
        }
        if (!results || !results.length) {
            return res.send({ code: 1, reason: '菜谱不存在' });
        }

        const recipe = results[0];
        // 解析 ingredients（如果是 JSON 字符串）
        try {
            recipe.ingredients = typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients;
        } catch (e) {
            recipe.ingredients = [];
        }

        // 如果用户已登录，查询是否收藏
        if (req.user && req.user.id) {
            const favQuery = `SELECT id FROM favorites WHERE account_id = ? AND recipe_id = ? LIMIT 1`;
            connection.query(favQuery, [req.user.id, id], (err2, favResults) => {
                recipe.isFavorited = favResults && favResults.length > 0;
                res.send({ code: 0, data: recipe });
            });
        } else {
            recipe.isFavorited = false;
            res.send({ code: 0, data: recipe });
        }
    });
});

/**
 * POST /diy/favorite
 * 收藏菜谱（需要登录）
 */
router.post('/favorite', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.send({ code: 1, reason: '请先登录' });
    }

    const { recipe_id } = req.body || {};
    if (!recipe_id) {
        return res.send({ code: 1, reason: 'recipe_id 不能为空' });
    }

    // 检查菜谱是否存在
    const checkQuery = `SELECT id FROM recipes WHERE id = ? LIMIT 1`;
    connection.query(checkQuery, [recipe_id], (err, results) => {
        if (err || !results || !results.length) {
            return res.send({ code: 1, reason: '菜谱不存在' });
        }

        // 插入收藏（如果已存在则忽略）
        const insertQuery = `INSERT IGNORE INTO favorites (account_id, recipe_id) VALUES (?, ?)`;
        connection.query(insertQuery, [req.user.id, recipe_id], (err2) => {
            if (err2) {
                console.error('收藏失败:', err2);
                return res.send({ code: 1, reason: '收藏失败' });
            }
            res.send({ code: 0, reason: '收藏成功' });
        });
    });
});

/**
 * DELETE /diy/favorite/:recipe_id
 * 取消收藏菜谱（需要登录）
 */
router.delete('/favorite/:recipe_id', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.send({ code: 1, reason: '请先登录' });
    }

    const { recipe_id } = req.params;
    const deleteQuery = `DELETE FROM favorites WHERE account_id = ? AND recipe_id = ?`;
    connection.query(deleteQuery, [req.user.id, recipe_id], (err) => {
        if (err) {
            console.error('取消收藏失败:', err);
            return res.send({ code: 1, reason: '取消收藏失败' });
        }
        res.send({ code: 0, reason: '取消收藏成功' });
    });
});

/**
 * GET /diy/favorites
 * 获取用户的收藏菜谱（需要登录）
 */
router.get('/favorites', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.send({ code: 1, reason: '请先登录' });
    }

    const query = `
        SELECT r.* FROM recipes r
        INNER JOIN favorites f ON r.id = f.recipe_id
        WHERE f.account_id = ?
        ORDER BY f.created_at DESC
    `;
    connection.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error('查询收藏失败:', err);
            return res.send({ code: 1, reason: '查询失败' });
        }
        const enriched = (results || []).map(r => {
            try {
                r.ingredients = typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients;
            } catch (e) {
                r.ingredients = [];
            }
            return { ...r, isFavorited: true };
        });
        res.send({ code: 0, data: enriched });
    });
});

module.exports = router;
