<template>
  <div class="section-container">
    <!-- 导航栏组件 -->
    <AppNavbar
      :username="username"
      :avatar-src="avatarSrc"
      v-model="searchInput"
      @search="handleSearch"
      @command="handleCommand"
      @brand-click="() => router.push('/section')"
    />

    <!-- 主体内容区域 -->
    <main class="main-content">
      <div class="content-cards">
        <!-- 随便吃点吧 -->
        <div class="card-item random-card" @click="handleRandomChoice">
          <div class="card-overlay"></div>
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="60"><Dish /></el-icon>
            </div>
            <h2 class="card-title">随便吃点吧</h2>
            <p class="card-desc">让我们为您随机推荐美食</p>
          </div>
        </div>

        <!-- DIY -->
        <div class="card-item diy-card" @click="handleDIY">
          <div class="card-overlay"></div>
          <div class="card-content">
            <div class="card-icon">
              <el-icon :size="60"><ForkSpoon /></el-icon>
            </div>
            <h2 class="card-title">DIY</h2>
            <p class="card-desc">想吃什么自己做</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, User, Setting, Lock, SwitchButton, Dish, ForkSpoon } from '@element-plus/icons-vue'
import AppNavbar from '../components/AppNavbar.vue'
import { getUserInfo } from '../api/account'
import local from '../utils/local'

const router = useRouter()

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

const avatarSrc = computed(() => normalizeAvatar(userAvatar.value) || defaultAvatar.value)

onMounted(() => {
  loadUserInfo()
})

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

const handleSearch = () => {
  if (searchInput.value.trim()) {
    ElMessage.success(`搜索: ${searchInput.value}`)
    // 实现搜索逻辑
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/userinfo')
      break
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

const handleRandomChoice = () => {
  router.push('/random-select')
}

const handleDIY = () => {
  // ElMessage.success('DIY 功能')
  // 跳转到 DIY 页面
  router.push('/diy')
}
</script>

<style lang="scss" scoped>
.section-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url(../assets/images/bg6.jpg) no-repeat center center;
    background-size: cover;
    opacity: 0.2;
    z-index: 0;
  }

  // 导航栏
  .navbar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 40px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }

      .logo {
        width: 60px;
        height: 45px;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .brand-text {
        font-size: 24px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .navbar-search {
      flex: 1;
      max-width: 500px;
      margin: 0 40px;

      :deep(.el-input__wrapper) {
        border-radius: 25px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        padding: 5px 15px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        }
      }

      :deep(.el-input-group__append) {
        border-radius: 0 25px 25px 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;

        .el-button {
          background: transparent;
          border: none;
          color: white;
          font-weight: 600;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }

    .navbar-user {
      .user-avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-radius: 30px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(102, 126, 234, 0.05);

        &:hover {
          background: rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .user-avatar {
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.1);
          }
        }

        .username {
          font-weight: 600;
          color: #333;
          font-size: 15px;
        }
      }
    }
  }

  // 主体内容
  .main-content {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;

    .content-cards {
      display: flex;
      gap: 60px;
      max-width: 1200px;
      width: 100%;
      justify-content: center;
      align-items: center;

      .card-item {
        position: relative;
        width: 350px;
        height: 350px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

        &:hover {
          transform: scale(1.1) translateY(-10px);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);

          .card-overlay {
            background: rgba(0, 0, 0, 0.3);
          }

          .card-content {
            transform: translateY(-10px);

            .card-icon {
              transform: scale(1.2) rotate(10deg);
            }
          }
        }

        &.random-card {
          background: url(../assets/images/section2.png) center center;
          background-size: cover;
        }

        &.diy-card {
          background: url(../assets/images/section4.png) center center;
          background-size: cover;
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
        }

        .card-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          transition: transform 0.3s ease;

          .card-icon {
            margin-bottom: 20px;
            transition: transform 0.3s ease;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          }

          .card-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 10px 0;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            letter-spacing: 2px;
          }

          .card-desc {
            font-size: 16px;
            margin: 0;
            opacity: 0.9;
            text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
          }
        }
      }
    }
  }
}

// Element Plus 样式覆盖
:deep(.el-dropdown-menu__item) {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  transition: all 0.3s ease;

  .el-icon {
    font-size: 18px;
  }

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    color: #667eea;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .section-container {
    .navbar {
      padding: 15px 20px;

      .navbar-search {
        max-width: 350px;
        margin: 0 20px;
      }
    }

    .main-content {
      .content-cards {
        gap: 40px;

        .card-item {
          width: 300px;
          height: 300px;

          .card-content {
            .card-title {
              font-size: 28px;
            }

            .card-desc {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .section-container {
    .navbar {
      flex-wrap: wrap;
      padding: 15px;
      gap: 15px;

      .navbar-brand {
        .brand-text {
          font-size: 20px;
        }
      }

      .navbar-search {
        order: 3;
        max-width: 100%;
        width: 100%;
        margin: 0;
      }

      .navbar-user {
        .user-avatar-wrapper {
          .username {
            display: none;
          }
        }
      }
    }

    .main-content {
      padding: 30px 15px;

      .content-cards {
        flex-direction: column;
        gap: 30px;

        .card-item {
          width: 280px;
          height: 280px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .section-container {
    .navbar {
      .navbar-brand {
        .logo {
          width: 35px;
          height: 35px;
        }

        .brand-text {
          font-size: 18px;
        }
      }
    }

    .main-content {
      .content-cards {
        .card-item {
          width: 250px;
          height: 250px;

          .card-content {
            .card-icon {
              :deep(.el-icon) {
                font-size: 50px;
              }
            }

            .card-title {
              font-size: 24px;
            }

            .card-desc {
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}

// 动画
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>