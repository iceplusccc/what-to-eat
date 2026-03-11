/**
 * 高德地图 API 密钥配置
 * 
 * 获取方式：
 * 1. 访问 https://lbs.amap.com/
 * 2. 注册开发者账号并登录
 * 3. 进入 "我的应用" → "创建新应用"
 * 4. 在应用中添加 "Web 服务 API" 的密钥
 * 5. 复制 Key 值到下面的配置中
 */

module.exports = {
    // Web API Key（用于浏览器端调用）
    WEB_API_KEY: 'f482c27289905814140cfbf0819bb888',
    
    // Server API Key（用于服务器端调用，建议使用此类型）
    SERVER_API_KEY: 'YOUR_SERVER_API_KEY_HERE',
    
    // API 基础 URL
    BASE_URL: 'https://restapi.amap.com/v3',
    
    // 服务配置
    SERVICES: {
        // 周边搜索接口
        NEARBY_SEARCH: '/place/around',
        
        // 文本搜索接口
        TEXT_SEARCH: '/place/text',
        
        // 地理编码接口（地址转坐标）
        GEOCODE: '/geocode/geo',
        
        // 反向地理编码接口（坐标转地址）
        REGEO: '/geocode/regeo'
    },
    
    // 搜索参数配置
    SEARCH_CONFIG: {
        // 默认搜索半径（米）
        DEFAULT_RADIUS: 3000,
        
        // 最大搜索半径（米）
        MAX_RADIUS: 5000,
        
        // 默认返回结果数
        DEFAULT_PAGE_SIZE: 20,
        
        // 搜索超时时间（毫秒）
        TIMEOUT: 10000
    }
};
