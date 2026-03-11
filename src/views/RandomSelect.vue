<template>
  <div class="random-select-container">
    <!-- 复用导航栏组件 -->
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
      <h1 class="page-title">随机美食推荐</h1>
      <el-button :icon="Refresh" @click="openFilterDialog" class="filter-btn" type="primary">筛选</el-button>
    </div>

    <!-- 位置信息提示 -->
    <div class="location-info" v-if="location.address">
      <el-icon>
        <LocationFilled />
      </el-icon>
      <span>{{ location.address }}</span>
      <el-button text type="primary" size="small" @click="resetLocation">重新定位</el-button>
    </div>

    <div class="content-wrapper">
      <!-- 主菜品展示区 -->
      <div class="food-showcase">
        <el-card class="food-card" shadow="hover" v-if="currentFood && Object.keys(currentFood).length > 0">
          <!-- 菜品图片 -->
          <div class="food-image-wrapper">
            <el-image :src="currentFood.image_url || '/images/default-food.jpg'" alt="菜品图片" class="food-image"
              :preview-src-list="[currentFood.image_url || '/images/default-food.jpg']" />
            <div class="popularity-badge">热度 {{ currentFood.popularity }}</div>
          </div>

          <!-- 菜品信息 -->
          <div class="food-info">
            <h2 class="food-name">{{ currentFood.name }}</h2>
            <p class="food-category">
              <el-tag type="success" effect="plain">{{ currentFood.category }}</el-tag>
              <el-tag v-if="currentFood.sub_category" type="info" effect="plain">{{ currentFood.sub_category }}</el-tag>
            </p>
            <p class="food-description">{{ currentFood.description }}</p>
            <div class="food-details">
              <span class="price">¥ {{ currentFood.avg_price }}</span>
              <div class="tags" v-if="currentFood.tags && currentFood.tags.length > 0">
                <el-tag v-for="tag in currentFood.tags" :key="tag" type="warning" effect="light" size="small">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button :icon="RefreshRight" size="large" @click="getRandomRecommendation">
              换一个
            </el-button>
          </div>
        </el-card>

        <!-- 加载状态 -->
        <div class="loading-state" v-if="loading">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="!loading && (!currentFood || Object.keys(currentFood).length === 0)">
          <el-empty description="暂无推荐菜品" />
        </div>
      </div>

      <!-- 附近店铺列表 -->
      <div class="restaurants-section">
        <div class="restaurants-header">
          <h3>
            <el-icon>
              <Shop />
            </el-icon>
            附近餐厅（{{ nearbyRestaurants.length }} 家）
          </h3>
          <el-select v-model="sortBy" placeholder="排序方式" size="small" style="width: 120px" @change="sortRestaurants">
            <el-option label="距离最近" value="distance" />
            <el-option label="评分最高" value="rating" />
            <el-option label="人均消费最低" value="cost" />
          </el-select>
        </div>

        <!-- 餐厅卡片列表 -->
        <div class="restaurants-list">
          <el-scrollbar style="height: 850px;" v-if="!loading && nearbyRestaurants.length !== 0">
            <el-card v-for="restaurant in nearbyRestaurants" :key="restaurant.id" class="restaurant-card"
              shadow="hover">
              <div class="restaurant-header">
                <h4 class="restaurant-name">{{ restaurant.name }}</h4>
                <el-rate v-model="restaurant.rating" disabled allow-half size="small" />
              </div>

              <div class="restaurant-info">
                <p class="address">
                  <el-icon>
                    <Location />
                  </el-icon>
                  {{ restaurant.address }}
                </p>
                <p class="distance">
                  <el-icon>
                    <Compass />
                  </el-icon>
                  距您 {{ formatDistance(restaurant.distance) }}
                </p>
                <p class="delivery" v-if="restaurant.delivery_time">
                  <el-icon>
                    <Clock />
                  </el-icon>
                  约 {{ restaurant.delivery_time }} 分钟送达
                </p>
                <p class="cost" v-if="restaurant.cost">
                  <el-icon>
                    <Money />
                  </el-icon>
                  人均消费 {{ restaurant.cost.length ? `¥${restaurant.cost}` : '暂无' }}
                </p>
              </div>

              <div class="restaurant-footer">
                <div class="fees">
                  <span v-if="restaurant.delivery_fee > 0" class="fee">配送费 ¥{{ restaurant.delivery_fee }}</span>
                  <span v-if="restaurant.min_order > 0" class="fee">起送 ¥{{ restaurant.min_order }}</span>
                </div>
                <div class="actions">
                  <el-button type="primary" size="small" @click="callRestaurant(restaurant)" v-if="restaurant.phone">
                    <el-icon>
                      <Phone />
                    </el-icon>
                  </el-button>
                  <el-button type="success" size="small" @click="openSelecyWay(restaurant)">
                    <el-icon>
                      <MapLocation />
                    </el-icon>
                    地图
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-scrollbar>
          <!-- 空餐厅列表 -->
          <div class="empty-state" v-if="!loading && nearbyRestaurants.length === 0">
            <el-empty description="暂无附近餐厅数据" />
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选对话框 -->
    <el-dialog v-model="filterDialogVisible" title="筛选条件" width="500px">
      <el-form :model="filterForm" label-width="100px">
        <el-form-item label="菜系">
          <el-select v-model="filterForm.category" placeholder="选择菜系" clearable>
            <el-option label="川菜" value="川菜" />
            <el-option label="粤菜" value="粤菜" />
            <el-option label="浙菜" value="浙菜" />
            <el-option label="京菜" value="京菜" />
            <el-option label="江浙菜" value="江浙菜" />
            <el-option label="中式" value="中式" />
            <el-option label="家常菜" value="家常菜" />
          </el-select>
        </el-form-item>

        <el-form-item label="价格范围">
          <el-slider v-model="filterForm.max_price" :min="0" :max="200" :step="10" range
            :marks="{ 0: '¥0', 200: '¥200+' }" />
        </el-form-item>

        <el-form-item label="搜索半径">
          <el-slider v-model="filterForm.radius" :min="500" :max="5000" :step="500"
            :marks="{ 500: '0.5km', 3000: '3km', 5000: '5km' }" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="filterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applyFilter">应用筛选</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="selectWayVisible" title="请选择出行方式" width="500px">
      <!-- 用 @change，label 即为值 -->
      <el-radio-group v-model="transportation" size="large" fill="#6cf" @change="openInMap">
        <el-radio-button label="driving">驾车</el-radio-button>
        <el-radio-button label="transit">公交</el-radio-button>
        <el-radio-button label="walking">步行</el-radio-button>
        <el-radio-button label="bicycling">骑行</el-radio-button>
      </el-radio-group>
    </el-dialog>
  </div>

</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import {
  ArrowLeft, Refresh, RefreshRight, LocationFilled, Shop, Location, Compass,
  Clock, Phone, MapLocation,
  Money
} from '@element-plus/icons-vue'
import { getRandomRecommendation as fetchRandomRecommendation } from '../api/recommendation'
import { getUserInfo } from '../api/account'
import local from '../utils/local'
import AppNavbar from '../components/AppNavbar.vue'
import http from '../utils/request' // 使用项目封装的 axios 客户端

const router = useRouter()

// 状态管理
const loading = ref(false)
const currentFood = ref({})
const nearbyRestaurants = ref([])
const location = reactive({
  latitude: null,
  longitude: null,
  address: ''
})
const sortBy = ref('distance')
const transportation = ref('')
const restaurantLocation = reactive(
  {
    latitude: null,
    longitude: null,
  }
)

// 导航栏相关状态
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

const normalizeImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${backendBase}${url}`
}

const avatarSrc = computed(() => normalizeAvatar(userAvatar.value) || defaultAvatar.value)

// 筛选表单
const filterDialogVisible = ref(false)
const selectWayVisible = ref(false)
const filterForm = reactive({
  category: '',
  max_price: [0, 200],
  radius: 3000
})

/**
 * 获取用户位置（地理定位）
 */
const getLocation = () => {
  if (!navigator.geolocation) {
    ElMessage.warning('您的浏览器不支持地理定位，请手动输入位置')
    // 可选：显示手动输入位置的对话框
    location.latitude = 39.9042 // 默认北京坐标
    location.longitude = 116.3554
    location.address = '北京市西城区'
    return
  }

  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在获取您的位置...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  navigator.geolocation.getCurrentPosition(
    (position) => {
      location.latitude = position.coords.latitude
      location.longitude = position.coords.longitude
      // 这里可以调用后端接口反向地理编码，获取地址
      location.address = `${location.latitude}, ${location.longitude}`
      loadingInstance.close()
      ElMessage.success('位置获取成功')
      getRandomRecommendation()
    },
    (error) => {
      loadingInstance.close()
      ElMessage.error('位置获取失败，已使用默认位置')
      // 使用默认位置（北京）
      location.latitude = 39.9042
      location.longitude = 116.3554
      location.address = '北京市西城区'
      getRandomRecommendation()
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

/**
 * 获取随机推荐
 */
const getRandomRecommendation = async () => {
  if (!location.latitude || !location.longitude) {
    ElMessage.error('位置信息不可用')
    return
  }

  loading.value = true
  try {
    const params = {
      latitude: location.latitude,
      longitude: location.longitude,
      category: filterForm.category || undefined,
      max_price: filterForm.max_price[1] || undefined,
      radius: filterForm.radius
    }

    const res = await fetchRandomRecommendation(params)
    if (res.code === 0) {
      // 标准化菜品图片 URL
      if (res.food && res.food.image_url) {
        res.food.image_url = normalizeImageUrl(res.food.image_url)
      }
      currentFood.value = res.food
      nearbyRestaurants.value = res.nearbyRestaurants || []
      // console.log("111111111111111")
      // console.log(res)
      // console.log(typeof (res.rating));

      // 更新位置信息
      if (res.location && res.location.address) {
        location.address = res.location.address
      }
      sortRestaurants()
    } else {
      ElMessage.error(res.reason || '获取推荐失败')
    }
  } catch (error) {
    console.error('获取推荐失败:', error)
    ElMessage.error('获取推荐失败')
  } finally {
    loading.value = false
  }
}

/**
 * 排序餐厅列表
 */
const sortRestaurants = () => {
  const restaurants = [...nearbyRestaurants.value]
  if (sortBy.value === 'distance') {
    restaurants.sort((a, b) => a.distance - b.distance)
  } else if (sortBy.value === 'rating') {
    restaurants.sort((a, b) => b.rating - a.rating)
  } else if (sortBy.value === 'cost') {
    restaurants.sort((a, b) => a.cost - b.cost)
  }
  nearbyRestaurants.value = restaurants
}

/**
 * 格式化距离显示
 */
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${meters}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 拨打餐厅电话
 */
const callRestaurant = (restaurant) => {
  window.location.href = `tel:${restaurant.phone}`
}

/**
 * 在地图中打开餐厅位置
 */
const openInMap = async (mode) => {
  // 更新选中值
  if (mode) transportation.value = mode
  const origin = `${location.longitude},${location.latitude}`
  const dest = `${restaurantLocation.longitude},${restaurantLocation.latitude}`
  // console.log(origin);
  // console.log(dest);
  
  
  try {
    const { data: res } = await http.get('/recommendation/route', {
      params: { mode: transportation.value || 'driving', origin, destination: dest }
    })
    // console.log(res);
    // console.log("44444444444");
    
    
    if (res.status === '1') {
      // TODO: 在页面内渲染路线（可后续接入 AMap JS SDK）
      ElMessage.success('路线规划成功')
      console.log('route result:', res.route.paths[0])
    } else {
      ElMessage.error(res.reason || '路线规划失败')
    }
  } catch (e) {
    ElMessage.error('路线规划失败（网络或CORS问题已由后端代理规避）')
    console.error(e)
  } finally {
    selectWayVisible.value = false
    transportation.value = ''
  }
}

/**
 * 应用筛选条件
 */
const applyFilter = () => {
  filterDialogVisible.value = false
  getRandomRecommendation()
}

const openSelecyWay=(restaurant) => {
  selectWayVisible.value = true
  restaurantLocation.latitude=restaurant.latitude
  restaurantLocation.longitude=restaurant.longitude
}

/**
 * 打开筛选对话框
 */
const openFilterDialog = () => {
  filterDialogVisible.value = true
}

/**
 * 重新定位
 */
const resetLocation = () => {
  getLocation()
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 组件挂载
 */
onMounted(() => {
  // 隐藏页面滚动条，仅针对本页面生命周期
  try {
    prevBodyOverflow.value = document.body.style.overflow;
    prevHtmlOverflow.value = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  } catch (e) {}
  // 加载用户信息以供导航栏展示
  loadUserInfo()
  getLocation()
})

onUnmounted(() => {
  // 恢复页面滚动条
  try {
    document.body.style.overflow = prevBodyOverflow.value || '';
    document.documentElement.style.overflow = prevHtmlOverflow.value || '';
  } catch (e) {}
})

// 记录进入页面前的 overflow 值
const prevBodyOverflow = ref('')
const prevHtmlOverflow = ref('')

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

// 导航栏搜索
const handleSearch = () => {
  if (searchInput.value.trim()) {
    ElMessage.success(`搜索: ${searchInput.value}`)
    // 可按需触发筛选或关键词搜索附近餐厅
  }
}

// 导航栏命令处理
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
.random-select-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  // padding: 20px;
  // padding-bottom: 60px;
  overflow: hidden;
  
  .navbar {
    position: relative;
    // width: 100%;
  }

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

    .filter-btn {
      min-width: 100px;
    }
  }

  .location-info {
    max-width: 1170px;
    margin: 0 auto 20px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .el-icon {
      color: #f56c6c;
      font-size: 18px;
    }

    span {
      flex: 1;
      color: #606266;
    }
  }

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .food-showcase {
    .food-card {
      border: none;
      border-radius: 12px;
      overflow: hidden;
      background: white;

      .food-image-wrapper {
        position: relative;
        width: 100%;
        height: 300px;
        overflow: hidden;
        background: #f5f5f5;

        .food-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .popularity-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 107, 107, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
      }

      .food-info {
        padding: 24px;

        .food-name {
          margin: 0 0 12px;
          font-size: 24px;
          font-weight: 700;
          color: #0c2d48;
        }

        .food-category {
          margin: 0 0 12px;
          display: flex;
          gap: 8px;
        }

        .food-description {
          margin: 0 0 16px;
          color: #606266;
          line-height: 1.6;
          font-size: 14px;
        }

        .food-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;

          .price {
            font-size: 24px;
            font-weight: 700;
            color: #f56c6c;
          }

          .tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }
        }
      }

      .action-buttons {
        padding: 0 24px 24px;
        display: flex;
        gap: 12px;

        .el-button {
          flex: 1;
        }
      }
    }

    .loading-state,
    .empty-state {
      padding: 60px 20px;
      text-align: center;
    }
  }

  .restaurants-section {
    .restaurants-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 0 4px;

      h3 {
        margin: 0;
        color: white;
        font-size: 18px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .el-icon {
        font-size: 22px;
      }
    }

    .restaurants-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .restaurant-card {
        border: none;
        border-radius: 8px;
        background: white;
        overflow: hidden;
        margin-bottom: 20px;

        .restaurant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;

          .restaurant-name {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #0c2d48;
            flex: 1;
          }
        }

        .restaurant-info {
          padding: 12px 16px;

          p {
            margin: 0 0 8px;
            color: #606266;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;

            &:last-child {
              margin-bottom: 0;
            }

            .el-icon {
              color: #909399;
              font-size: 14px;
            }
          }
        }

        .restaurant-footer {
          padding: 12px 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .fees {
            display: flex;
            gap: 8px;
            font-size: 12px;
            color: #909399;

            .fee {
              background: #f5f7fa;
              padding: 4px 8px;
              border-radius: 4px;
            }
          }

          .actions {
            display: flex;
            gap: 8px;
          }
        }
      }

      .empty-state {
        padding: 40px 20px;
        text-align: center;
        background: white;
        border-radius: 8px;
      }
    }
  }
}

:deep(.el-card__body) {
  padding: 0;
}

:deep(.el-dialog__body) {
  padding: 30px 20px;
}
</style>
