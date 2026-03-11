<template>
  <div class="diy-container">
    <!-- 复用导航栏 -->
    <AppNavbar
      :username="username"
      :avatar-src="avatarSrc"
      v-model="searchInput"
      @search="handleSearch"
      @command="handleCommand"
      @brand-click="() => router.push('/section')"
    />

    <!-- 头部导航 -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack" class="back-btn">返回</el-button>
      <h1 class="page-title">美食菜谱   </h1>
    </div>
    <!-- 主内容区 -->
    <div class="diy-content">
      <!-- 菜系分类选项卡 -->
      <div class="category-tabs">
        <el-tabs v-model="activeCategory" @tab-change="onCategoryChange" type="card">
          <el-tab-pane label="全部" name="全部" />
          <el-tab-pane v-for="cat in categories" :key="cat" :label="cat" :name="cat" />
        </el-tabs>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <el-input
          v-model="filterKeyword"
          placeholder="搜索菜谱名称..."
          prefix-icon="Search"
          clearable
          @input="onSearchInput"
          style="max-width: 300px"
        />
        <el-button type="primary" @click="handleFilterSearch">搜索</el-button>
        <div class="filter-tags">
          <el-tag v-for="tag in filterTags" :key="tag" closable @close="removeTag(tag)">
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 菜谱列表 -->
      <div class="recipes-grid">
        <el-empty v-if="recipes.length === 0 && !loading" description="暂无菜谱" />
        <el-skeleton v-if="loading" :rows="5" animated />

        <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card">
          <div class="recipe-image-wrapper">
            <img :src="recipe.image_url || '/images/default-recipe.jpg'" :alt="recipe.name" class="recipe-image" />
            <div class="recipe-overlay">
              <el-button type="primary" size="small" @click="viewRecipeDetail(recipe)">
                <el-icon><DocumentCopy /></el-icon>
                查看做法
              </el-button>
            </div>
            <div class="recipe-badges">
              <el-tag type="success" size="small">{{ recipe.category }}</el-tag>
              <el-tag type="info" size="small">{{ recipe.difficulty }}</el-tag>
            </div>
            <el-button
              :type="recipe.isFavorited ? 'danger' : 'default'"
              :icon="recipe.isFavorited ? StarFilled : Star"
              circle
              size="small"
              class="favorite-btn"
              @click="toggleFavorite(recipe)"
            />
          </div>

          <div class="recipe-info">
            <h3 class="recipe-name">{{ recipe.name }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>
            <div class="recipe-meta">
              <span v-if="recipe.prep_time" class="meta-item">
                <el-icon><Clock /></el-icon>
                准备: {{ recipe.prep_time }}分钟
              </span>
              <span v-if="recipe.cook_time" class="meta-item">
                <el-icon><Timer /></el-icon>
                烹饪: {{ recipe.cook_time }}分钟
              </span>
              <span v-if="recipe.servings" class="meta-item">
                <el-icon><User /></el-icon>
                {{ recipe.servings }}人份
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="recipes.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @change="onPageChange"
        />
      </div>
    </div>

    <!-- 菜谱详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="selectedRecipe?.name || '菜谱详情'" width="50%" @close="selectedRecipe = null" top="0vh">
      <div v-if="selectedRecipe" class="recipe-detail">
        <!-- 图片 -->
        <div class="detail-image-wrapper">
          <img :src="selectedRecipe.image_url || '/images/default-recipe.jpg'" :alt="selectedRecipe.name" />
        </div>

        <!-- 基本信息 -->
        <div class="detail-info">
          <div class="info-row">
            <span class="label">菜系:</span>
            <el-tag type="success">{{ selectedRecipe.category }}</el-tag>
          </div>
          <div class="info-row">
            <span class="label">难度:</span>
            <el-tag type="info">{{ selectedRecipe.difficulty }}</el-tag>
          </div>
          <div class="info-row">
            <span class="label">耗时:</span>
            准备 {{ selectedRecipe.prep_time }}分钟 + 烹饪 {{ selectedRecipe.cook_time }}分钟
          </div>
          <div class="info-row">
            <span class="label">份数:</span>
            {{ selectedRecipe.servings }}人份
          </div>
          <div class="info-row" v-if="selectedRecipe.calories">
            <span class="label">热量:</span>
            约 {{ selectedRecipe.calories }} 千卡/100g
          </div>
        </div>

        <!-- 食材 -->
        <div class="section">
          <h4>食材清单</h4>
          <el-table :data="parseIngredients(selectedRecipe.ingredients)" stripe style="width: 100%">
            <el-table-column prop="item" label="食材" width="150" />
            <el-table-column prop="amount" label="用量" />
          </el-table>
        </div>

        <!-- 做法步骤 -->
        <div class="section">
          <h4>烹饪步骤</h4>
          <ol class="steps-list">
            <li v-for="(step, idx) in parseSteps(selectedRecipe.instructions)" :key="idx" class="step-item">
              {{ step }}
            </li>
          </ol>
        </div>

        <!-- 小贴士 -->
        <div class="section" v-if="selectedRecipe.tips">
          <h4>小贴士</h4>
          <el-alert :title="selectedRecipe.tips" type="info" show-icon :closable="false" />
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          :type="selectedRecipe?.isFavorited ? 'danger' : 'primary'"
          @click="toggleFavorite(selectedRecipe)"
        >
          {{ selectedRecipe?.isFavorited ? '取消收藏' : '收藏菜谱' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    ArrowLeft,
  DocumentCopy,
  Clock,
  Timer,
  User,
  Star,
  StarFilled,
  Search
} from '@element-plus/icons-vue'
import AppNavbar from '../components/AppNavbar.vue'
import {
  getCategories,
  getRecipes,
  searchRecipes,
  getRecipeDetail,
  favoriteRecipe,
  unfavoriteRecipe,
  getFavorites
} from '../api/diy'
import { getUserInfo } from '../api/account'
import local from '../utils/local'

const router = useRouter()

// 导航栏状态
const searchInput = ref('')
const username = ref('用户')
const userAvatar = ref('')
const backendBaseRaw = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:5000'
const backendBase = (/^https?:\/\//i.test(backendBaseRaw) ? backendBaseRaw : `https://${backendBaseRaw}`).replace(/\/+$/, '')
const defaultAvatar = ref(`${backendBase}/upload/portrait.jpg`)

const normalizeAvatar = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${backendBase}${url}`
}

// 规范化菜谱图片 URL
const normalizeRecipeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${backendBase}${url}`
}

const avatarSrc = computed(() => normalizeAvatar(userAvatar.value) || defaultAvatar.value)

// 页面数据
const categories = ref([])
const recipes = ref([])
const activeCategory = ref('全部')
const filterKeyword = ref('')
const filterTags = ref([])
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const loading = ref(false)

const selectedRecipe = ref(null)
const detailDialogVisible = ref(false)

onMounted(async () => {
  await loadUserInfo()
  await loadCategories()
  await loadRecipes()
})

// 加载用户信息
const loadUserInfo = async () => {
  const token = local.get('user_token')
  if (!token || !token.account) return

  try {
    const res = await getUserInfo({ account: token.account })
    if (res.code === 0 && res.data) {
      username.value = res.data.nickname || res.data.account || '用户'
      userAvatar.value = normalizeAvatar(res.data.avatarUrl)
    }
  } catch (err) {
    console.error('获取用户信息失败', err)
  }
}

const goBack = () => {
  router.back()
}

// 加载菜系分类
const loadCategories = async () => {
  try {
    const res = await getCategories()
    if (res.code === 0) {
      categories.value = res.data || []
    }
  } catch (err) {
    console.error('获取菜系分类失败:', err)
  }
}

// 加载菜谱列表
const loadRecipes = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (activeCategory.value && activeCategory.value !== '全部') {
      params.category = activeCategory.value
    }
    if (filterKeyword.value) {
      params.keyword = filterKeyword.value
    }

    const res = await getRecipes(params)
    if (res.code === 0) {
      // 规范化菜谱图片 URL
      recipes.value = (res.data || []).map(recipe => ({
        ...recipe,
        image_url: normalizeRecipeImageUrl(recipe.image_url)
      }))
      total.value = res.total || 0
    } else {
      ElMessage.error(res.reason || '加载菜谱失败')
    }
  } catch (err) {
    console.error('加载菜谱失败:', err)
    ElMessage.error('加载菜谱失败')
  } finally {
    loading.value = false
  }
}

// 菜系分类切换
const onCategoryChange = () => {
  currentPage.value = 1
  loadRecipes()
}

// 搜索输入
const onSearchInput = () => {
  currentPage.value = 1
}

// 搜索按钮
const handleFilterSearch = () => {
  if (filterKeyword.value.trim()) {
    filterTags.value = [filterKeyword.value]
  }
  currentPage.value = 1
  loadRecipes()
}

// 移除筛选标签
const removeTag = (tag) => {
  filterKeyword.value = ''
  filterTags.value = []
  loadRecipes()
}

// 分页变化
const onPageChange = () => {
  loadRecipes()
}

// 查看菜谱详情
const viewRecipeDetail = async (recipe) => {
  try {
    const res = await getRecipeDetail(recipe.id)
    if (res.code === 0) {
      // 规范化菜谱图片 URL
      selectedRecipe.value = {
        ...res.data,
        image_url: normalizeRecipeImageUrl(res.data.image_url)
      }
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res.reason || '加载菜谱详情失败')
    }
  } catch (err) {
    console.error('加载菜谱详情失败:', err)
    ElMessage.error('加载菜谱详情失败')
  }
}

// 切换收藏
const toggleFavorite = async (recipe) => {
  const token = local.get('user_token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    if (recipe.isFavorited) {
      const res = await unfavoriteRecipe(recipe.id)
      if (res.code === 0) {
        recipe.isFavorited = false
        ElMessage.success('已取消收藏')
      }
    } else {
      const res = await favoriteRecipe(recipe.id)
      if (res.code === 0) {
        recipe.isFavorited = true
        ElMessage.success('已收藏')
      }
    }
  } catch (err) {
    console.error('收藏操作失败:', err)
    ElMessage.error('操作失败，请重试')
  }
}

// 解析食材（处理 JSON）
const parseIngredients = (ingredients) => {
  if (!ingredients) return []
  if (typeof ingredients === 'string') {
    try {
      return JSON.parse(ingredients)
    } catch (e) {
      return []
    }
  }
  return Array.isArray(ingredients) ? ingredients : []
}

// 解析步骤（按数字分隔）
const parseSteps = (instructions) => {
  if (!instructions) return []
  return instructions.split(/\d+\./).filter(step => step.trim())
}

// 导航栏搜索
const handleSearch = () => {
  if (searchInput.value.trim()) {
    ElMessage.success(`搜索: ${searchInput.value}`)
  }
}

// 导航栏命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
    case 'settings':
      router.push('/userinfo')
      break
    case 'password':
      router.push('/modify-password')
      break
    case 'logout':
      ElMessage.success('退出登录成功')
      local.remove('user_token')
      router.push('/login')
      break
  }
}
</script>

<style lang="scss" scoped>
.diy-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  // padding-bottom: 60px;

   .page-header {
    padding-top: 2opx;
    max-width: 1200px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding-top: 20px;

    .back-btn {
      background: white;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateX(-3px);
      }
    }

    .page-title {
      flex: 1;
      margin: 0;
      color: white;
      font-size: 28px;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
    }

  .diy-content {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
  }

  // 菜系分类
  .category-tabs {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    :deep(.el-tabs__header) {
      margin: 0;
    }
  }

  // 筛选区
  .filter-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .filter-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      flex: 1;

      .el-tag {
        margin: 0;
      }
    }
  }

  // 菜谱网格
  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .recipe-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

        .recipe-overlay {
          opacity: 1;
        }
      }

      // 图片区
      .recipe-image-wrapper {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: #f5f5f5;

        .recipe-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        // 悬停按钮
        .recipe-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        // 标签
        .recipe-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 6px;

          .el-tag {
            font-size: 12px;
          }
        }

        // 收藏按钮
        .favorite-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: white;

          &:hover {
            background: white;
          }
        }
      }

      // 信息区
      .recipe-info {
        padding: 16px;

        .recipe-name {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #0c2d48;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recipe-description {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
        }

        .recipe-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #999;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;

            .el-icon {
              font-size: 14px;
            }
          }
        }
      }
    }
  }

  // 分页
  .pagination {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  // 菜谱详情弹窗
  .recipe-detail {
    .detail-image-wrapper {
      width: 100%;
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f5f5;

      img {
        width: 100%;
        height: auto;
        object-fit: contain;
        max-height: 500px;
      }
    }

    .detail-info {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 20px;

      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 600;
          min-width: 80px;
          color: #333;
        }
      }
    }

    .section {
      margin-bottom: 30px;

      h4 {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #0c2d48;
        border-bottom: 2px solid #667eea;
        padding-bottom: 10px;
      }

      .steps-list {
        margin: 0;
        padding-left: 20px;

        .step-item {
          margin-bottom: 12px;
          line-height: 1.6;
          color: #333;
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .diy-container {
    .diy-content {
      padding: 10px;
    }

    .recipes-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
    }

    .filter-section {
      flex-direction: column;
      align-items: stretch;

      .el-input {
        width: 100%;
      }

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
