/**
 * 随机推荐美食和附近店铺路由
 */

const express = require('express');
const router = express.Router();
const connection = require('./js/mysql');
const amapService = require('../utils/amapService');
const jwt = require('express-jwt');

// JWT 配置
const SECRET = 'itsource';

// 配置 JWT 中间件 - express-jwt v5.x 语法
const jwtMiddleware = jwt({ 
    secret: SECRET,
    credentialsRequired: false // 允许未认证的请求通过
}).unless({
    path: [
        '/recommendation/random',
        '/recommendation/stats'
    ]
});

// 应用 JWT 中间件
router.use(jwtMiddleware);

// 将高德返回的结果与本地餐厅合并，按距离排序并去重
function mergeAndFilterRestaurants(localList = [], amapList = []) {
    const byKey = new Map();
    const push = (r) => {
        if (!r) return;
        // 统一距离为数字
        const distance = typeof r.distance === 'string' ? parseInt(r.distance, 10) : r.distance;
        const key = `${(r.name || '').trim()}|${(r.address || '').trim()}`;
        if (!byKey.has(key)) {
            byKey.set(key, { ...r, distance: Number.isFinite(distance) ? distance : 999999 });
        } else {
            // 取更近的一条
            const prev = byKey.get(key);
            if (distance < prev.distance) {
                byKey.set(key, { ...r, distance: Number.isFinite(distance) ? distance : prev.distance });
            }
        }
    };
    localList.forEach(push);
    amapList.forEach(push);

    return Array.from(byKey.values()).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

/**
 * GET /recommendation/random
 * 随机推荐菜品和附近店铺
 * 
 * 查询参数：
 * - latitude: 用户纬度（必需）
 * - longitude: 用户经度（必需）
 * - category: 菜系筛选（可选，如"川菜"）
 * - max_price: 价格上限（可选，单位元）
 * - radius: 搜索半径（可选，默认3000米）
 * 
 * 返回：
 * {
 *   code: 0,
 *   food: { 选中的菜品信息 },
 *   nearbyRestaurants: [ 附近餐厅列表 ],
 *   location: { 用户位置地址 }
 * }
 */
router.get('/random', async (req, res) => {
    try {
        const { latitude, longitude, category, max_price, radius = 3000 } = req.query;

        // 验证必需参数
        if (!latitude || !longitude) {
            return res.send({
                code: 1,
                reason: '缺少位置信息（latitude/longitude）'
            });
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const maxPrice = max_price ? parseFloat(max_price) : null;

        // 1. 构建查询条件，随机选择菜品
        let foodQuery = 'SELECT * FROM foods WHERE 1=1';
        const foodParams = [];

        // 按菜系筛选
        if (category) {
            foodQuery += ' AND category = ?';
            foodParams.push(category);
        }

        // 按价格筛选
        if (maxPrice) {
            foodQuery += ' AND avg_price <= ?';
            foodParams.push(maxPrice);
        }

        // 加权随机：popularity 越高，被选中的概率越高
        // 使用 ORDER BY RAND() * popularity 实现加权随机
        foodQuery += ' ORDER BY RAND() * (popularity / 100 + 1) DESC LIMIT 1';

        // 2. 从数据库随机选择菜品
        connection.query(foodQuery, foodParams, async (err, foodResults) => {
            if (err) {
                console.error('查询菜品失败:', err);
                return res.send({ code: 1, reason: '查询菜品失败' });
            }

            if (!foodResults || foodResults.length === 0) {
                return res.send({ code: 1, reason: '没有符合条件的菜品' });
            }

            const selectedFood = foodResults[0];
            const foodId = selectedFood.id;

            // 3. 记录推荐历史（如果用户已登录）
            if (req.user && req.user.id) {
                const historyQuery = `
                    INSERT INTO recommendation_history (account_id, food_id, latitude, longitude)
                    VALUES (?, ?, ?, ?)
                `;
                connection.query(historyQuery, [req.user.id, foodId, lat, lon], (err) => {
                    if (err) console.error('保存推荐历史失败:', err);
                });
            }

            // 4. 从数据库查询距离用户最近的开放餐厅
            // 使用勾股定理计算距离（近似）
            const restaurantQuery = `
                SELECT *,
                    ROUND(
                        6371 * 2 * ASIN(
                            SQRT(
                                POW(SIN(RADIANS((latitude - ?) / 2)), 2) +
                                COS(RADIANS(?)) * COS(RADIANS(latitude)) *
                                POW(SIN(RADIANS((longitude - ?) / 2)), 2)
                            )
                        ) * 1000
                    ) AS distance
                FROM restaurants
                WHERE status = 'open'
                ORDER BY distance ASC
                LIMIT 20
            `;

            connection.query(restaurantQuery, [lat, lat, lon], async (err, restaurants) => {
                if (err) {
                    console.error('查询餐厅失败:', err);
                    return res.send({ code: 1, reason: '查询餐厅失败' });
                }

                // 5. 尝试调用高德 API 获取真实的附近餐厅（如需要）
                // 优先使用本地数据库，降低 API 调用成本
                let nearbyRestaurants = restaurants || [];

                // 如果配置了可用的高德 Server Key，则调用官方接口增强结果
                try {
                    const serverKey = (amapService.AMAP_CONFIG && amapService.AMAP_CONFIG.SERVER_API_KEY) || '';
                    const looksLikePlaceholder = !serverKey || /YOUR_AMAP|YOUR_SERVER_API_KEY|YOUR_WEB_API_KEY/i.test(serverKey);
                    if (!looksLikePlaceholder) {
                        const amapResults = await amapService.searchNearbyRestaurants({
                            latitude: lat,
                            longitude: lon,
                            keywords: selectedFood.category || '餐厅',
                            radius: parseInt(radius, 10)
                        });
                        nearbyRestaurants = mergeAndFilterRestaurants(nearbyRestaurants, amapResults);
                    }
                } catch (e) {
                    // 外部服务失败不影响本地结果
                    console.warn('调用高德周边搜索失败，将仅返回本地餐厅：', e && e.message);
                }

                // 6. 获取用户位置的地址描述
                let locationName = '位置信息';
                try {
                    const serverKey = (amapService.AMAP_CONFIG && amapService.AMAP_CONFIG.SERVER_API_KEY) || '';
                    const looksLikePlaceholder = !serverKey || /YOUR_AMAP|YOUR_SERVER_API_KEY|YOUR_WEB_API_KEY/i.test(serverKey);
                    if (!looksLikePlaceholder) {
                        locationName = await amapService.getAddressFromCoords(lat, lon);
                    }
                } catch (e) {
                    console.warn('反向地理编码失败，使用默认位置信息：', e && e.message);
                    locationName = '位置信息';
                }

                // 7. 返回结果
                res.send({
                    code: 0,
                    reason: '推荐成功',
                    food: {
                        id: selectedFood.id,
                        name: selectedFood.name,
                        category: selectedFood.category,
                        sub_category: selectedFood.sub_category,
                        image_url: selectedFood.image_url,
                        description: selectedFood.description,
                        avg_price: selectedFood.avg_price,
                        tags: selectedFood.tags ? selectedFood.tags.split(',') : [],
                        popularity: selectedFood.popularity
                    },
                    nearbyRestaurants: nearbyRestaurants.map(r => ({
                        id: r.id,
                        name: r.name,
                        address: r.address,
                        latitude: r.latitude,
                        longitude: r.longitude,
                        distance: r.distance,
                        rating: Number(r.rating) || 4.5,
                        delivery_fee: r.delivery_fee,
                        min_order: r.min_order,
                        delivery_time: r.delivery_time,
                        phone: r.phone,
                        opening_hours: r.opening_hours,
                        status: r.status,
                        cost: r.cost,
                    })),
                    location: {
                        latitude: lat,
                        longitude: lon,
                        address: locationName
                    },
                    timestamp: new Date().toISOString()
                });
            });
        });
    } catch (error) {
        console.error('推荐接口异常:', error);
        res.send({ code: 1, reason: '服务异常' });
    }
});

/**
 * GET /recommendation/history
 * 获取当前用户的推荐历史
 */
router.get('/history', (req, res) => {
    if (!req.user || !req.user.id) {
        return res.send({ code: 1, reason: '用户未认证' });
    }

    const query = `
        SELECT rh.*, f.name, f.category, f.image_url
        FROM recommendation_history rh
        JOIN foods f ON rh.food_id = f.id
        WHERE rh.account_id = ?
        ORDER BY rh.created_at DESC
        LIMIT 50
    `;

    connection.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error('查询历史失败:', err);
            return res.send({ code: 1, reason: '查询失败' });
        }

        res.send({
            code: 0,
            data: results || [],
            total: (results || []).length
        });
    });
});

/**
 * GET /recommendation/stats
 * 获取推荐统计信息
 */
router.get('/stats', (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM foods) as total_foods,
            (SELECT COUNT(*) FROM restaurants) as total_restaurants,
            (SELECT COUNT(*) FROM recommendation_history) as total_recommendations,
            (SELECT COUNT(DISTINCT category) FROM foods) as categories_count
    `;

    connection.query(statsQuery, (err, results) => {
        if (err) {
            return res.send({ code: 1, reason: '查询失败' });
        }

        res.send({
            code: 0,
            data: results[0] || {}
        });
    });
});

router.get('/route', async (req, res) => {
  try {
    // console.log(req.query);
    // console.log("gggggggggggggggg");
    // console.log("=====================");

    const { mode, origin, destination } = req.query.params
    // console.log(mode , origin, destination );
    // console.log("qqqqqqqqqqqqq");
    

    // if (!origin || !destination) {
    //   return res.send({ code: 1, reason: '缺少 origin/destination 参数' })
    // }
    // 规范化 mode
    const m = ['driving','walking','bicycling','transit'].includes(mode) ? mode : 'driving'
    const data = await amapService.getRoutePlan({ mode: m, origin, destination })
    // console.log(data);
    
    return res.send({ code: 0, data })
  } catch (err) {
    // console.error('route plan error:', err?.response?.data || err.message)
    return res.send({ code: 1, reason: '路线规划失败', error: err.message })
  }
})

module.exports = router;
