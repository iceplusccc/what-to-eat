/**
 * 随机推荐相关 API
 */

import axios from "@/utils/request";

/**
 * 获取随机推荐菜品和附近店铺
 * @param {Object} params 查询参数
 * @param {number} params.latitude 用户纬度
 * @param {number} params.longitude 用户经度
 * @param {string} params.category 菜系（可选）
 * @param {number} params.max_price 价格上限（可选）
 * @param {number} params.radius 搜索半径（可选）
 */
export function getRandomRecommendation(params) {
    return axios.get("/recommendation/random", params);
}

/**
 * 获取推荐历史
 */
export function getRecommendationHistory() {
    return axios.get("/recommendation/history");
}

/**
 * 获取推荐统计信息
 */
export function getRecommendationStats() {
    return axios.get("/recommendation/stats");
}
