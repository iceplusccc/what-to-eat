/**
 * 高德地图 API 封装模块
 * 用于搜索附近餐厅等 POI 数据
 */

const axios = require('axios');

// 高德开放平台配置 - 需要替换为真实的 API Key
const AMAP_CONFIG = {
    WEB_API_KEY: '0ca70c4d72de4d5ed554dfab3c647023',      // 用于浏览器端的 Key
    SERVER_API_KEY: '0ca70c4d72de4d5ed554dfab3c647023', // 用于服务器端的 Key（建议用这个）
    BASE_URL: 'https://restapi.amap.com'
};

/**
 * 使用高德周边搜索接口查询附近的餐厅
 * @param {Object} options 搜索选项
 * @param {number} options.latitude 用户纬度
 * @param {number} options.longitude 用户经度
 * @param {string} options.keywords 搜索关键词（如"川菜馆"）
 * @param {number} options.radius 搜索半径（米，默认3000）
 * @param {number} options.pageSize 返回结果数（默认20）
 * @returns {Promise<Array>} 餐厅列表
 */
async function searchNearbyRestaurants(options) {
    const {
        latitude,
        longitude,
        keywords = '餐厅'|'饭店'|'小吃店',
        radius = 5000,
        pageSize = 100
    } = options;

    try {
        const response = await axios.get(`${AMAP_CONFIG.BASE_URL}/v3/place/around`, {
            params: {
                key: AMAP_CONFIG.SERVER_API_KEY,
                location: `${longitude},${latitude}`, // 高德用 lon,lat
                keywords: keywords,
                radius: radius,
                offset: pageSize,
                page: 1,
                extensions: 'all' // 获取详细信息
            }
        });

        if (response.data.status === '1') {
            // 处理返回的 POI 数据
            const pois = response.data.pois || [];
            // console.log("高德返回的餐厅数据：", pois);
            return pois.map(poi => ({
                id: poi.id,
                name: poi.name,
                address: poi.address,
                latitude: parseFloat(poi.location.split(',')[1]),
                longitude: parseFloat(poi.location.split(',')[0]),
                phone: poi.tel,
                distance: poi.distance, // 距离（米）
                businessArea: poi.businessarea,
                type: poi.type,
                rating: poi.biz_ext.rating || 4.5, // 若无评分则默认4.5
                openingHours: poi.opening_hours,
                cost: poi.biz_ext.cost,
            }));
        } else {
            console.error('高德API返回错误:', response.data.info);
            return [];
        }
    } catch (error) {
        console.error('调用高德地图 API 失败:', error.message);
        return [];
    }
}

/**
 * 使用高德地理编码接口获取坐标对应的地址
 * @param {number} latitude 纬度
 * @param {number} longitude 经度
 * @returns {Promise<string>} 地址信息
 */
async function getAddressFromCoords(latitude, longitude) {
    try {
        const response = await axios.get(`${AMAP_CONFIG.BASE_URL}/v3/geocode/regeo`, {
            params: {
                key: AMAP_CONFIG.SERVER_API_KEY,
                location: `${longitude},${latitude}`,
                extensions: 'all'
            }
        });

        if (response.data.status === '1') {
            return response.data.regeocode.formatted_address;
        } else {
            console.error('地址解析失败:', response.data.info);
            return '位置信息';
        }
    } catch (error) {
        console.error('地址解析请求失败:', error.message);
        return '位置信息';
    }
}

/**
 * 计算两点之间的直线距离（使用 Haversine 公式）
 * @param {number} lat1 第一个点的纬度
 * @param {number} lon1 第一个点的经度
 * @param {number} lat2 第二个点的纬度
 * @param {number} lon2 第二个点的经度
 * @returns {number} 距离（米）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

async function getRoutePlan({ mode, origin, destination }) {
  // mode: 'driving' | 'walking' | 'bicycling' | 'transit'
  const path = mode === 'transit' ? '/v5/direction/transit/integrated' : `/v5/direction/${mode}`
  const url = `${AMAP_CONFIG.BASE_URL}${path}`

  const params = {
    key: AMAP_CONFIG.SERVER_API_KEY,
    origin,
    destination
  }
//   console.log(params);
//   console.log("00000000000000s");
  

  const { data } = await axios.get(url, { params })
  return data
}

module.exports = {
    searchNearbyRestaurants,
    getAddressFromCoords,
    calculateDistance,
    getRoutePlan,
    AMAP_CONFIG
};
