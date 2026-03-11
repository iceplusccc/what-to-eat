/**
 * DIY 菜谱模块 API
 */

import axios from '../utils/request';

// 获取菜系分类
export function getCategories() {
    return axios.get('/diy/categories');
}

// 获取菜谱列表
export function getRecipes(params) {
    return axios.get('/diy/recipes', params);
}

// 搜索菜谱
export function searchRecipes(params) {
    return axios.get('/diy/search', params);
}

// 获取菜谱详情
export function getRecipeDetail(id) {
    return axios.get(`/diy/recipe/${id}`);
}

// 收藏菜谱
export function favoriteRecipe(recipe_id) {
    return axios.post('/diy/favorite', { recipe_id });
}

// 取消收藏
export function unfavoriteRecipe(recipe_id) {
    return axios.get(`/diy/favorite/${recipe_id}`, {});
}

// 获取用户收藏列表
export function getFavorites() {
    return axios.get('/diy/favorites');
}
