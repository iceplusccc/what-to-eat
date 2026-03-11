<template>
  <div class="userinfo-container">
    <!-- 顶部导航 -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack" class="back-btn">返回</el-button>
      <h1 class="page-title">个人信息</h1>
    </div>

    <div class="userinfo-content">
      <!-- 左侧头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-avatar :size="180" :src="avatarSrc" class="user-avatar" />
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
          >
            <el-button type="primary" :icon="Camera" circle class="upload-btn" />
          </el-upload>
        </div>
        <p class="avatar-tip">点击按钮更换头像</p>
        <div class="user-summary">
          <h2>{{ userInfo.account }}</h2>
          <p class="join-date">
            <el-icon><Calendar /></el-icon>
            加入时间：{{ formatDate(userInfo.ctime) }}
          </p>
        </div>
      </div>

      <!-- 右侧信息表单 -->
      <div class="info-section">
        <el-card class="info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">基本信息</span>
              <el-button 
                v-if="!isEditing" 
                type="primary" 
                :icon="Edit" 
                @click="startEdit"
              >
                编辑
              </el-button>
              <div v-else class="edit-actions">
                <el-button :icon="Close" @click="cancelEdit">取消</el-button>
                <el-button 
                  type="primary" 
                  :icon="Check" 
                  @click="saveEdit"
                  :loading="saving"
                >
                  保存
                </el-button>
              </div>
            </div>
          </template>

          <el-form :model="formData" label-width="100px" class="user-form">
            <!-- 账号名称 -->
            <el-form-item label="账号名称">
              <el-input 
                v-model="formData.account" 
                :disabled="true"
                placeholder="账号名称不可修改"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="昵称">
              <el-input 
                v-model="formData.nickname" 
                :disabled="!isEditing"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 性别 -->
            <el-form-item label="性别">
              <el-radio-group v-model="formData.gender" :disabled="!isEditing">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
                <el-radio label="保密">保密</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 电子邮箱 -->
            <el-form-item label="电子邮箱">
              <el-input 
                v-model="formData.email" 
                :disabled="!isEditing"
                placeholder="请输入电子邮箱"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 手机号 -->
            <el-form-item label="手机号">
              <el-input 
                v-model="formData.phone" 
                :disabled="!isEditing"
                placeholder="请输入手机号"
                maxlength="11"
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 创建时间 -->
            <el-form-item label="创建时间">
              <el-input 
                :value="formatDate(userInfo.ctime)" 
                disabled
              >
                <template #prefix>
                  <el-icon><Clock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 统计信息卡片 -->
        <el-card class="stats-card" shadow="hover">
          <template #header>
            <span class="card-title">账户统计</span>
          </template>
          <div class="stats-content">
            <div class="stat-item">
              <el-icon :size="30" color="#409EFF"><Star /></el-icon>
              <div class="stat-info">
                <p class="stat-value">0</p>
                <p class="stat-label">收藏</p>
              </div>
            </div>
            <div class="stat-item">
              <el-icon :size="30" color="#67C23A"><Document /></el-icon>
              <div class="stat-info">
                <p class="stat-value">0</p>
                <p class="stat-label">菜谱</p>
              </div>
            </div>
            <div class="stat-item">
              <el-icon :size="30" color="#E6A23C"><View /></el-icon>
              <div class="stat-info">
                <p class="stat-value">0</p>
                <p class="stat-label">浏览</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { 
  ArrowLeft, Edit, Check, Close, Camera, User, Message, Phone, 
  Calendar, Clock, Star, Document, View 
} from '@element-plus/icons-vue'
import { getUserInfo, updateUserInfo } from '../api/account'
import request from '../utils/request'
import local from '../utils/local'

const router = useRouter()

const backendBase = 'http://127.0.0.1:5000'
const defaultAvatar = ref(`${backendBase}/upload/portrait.jpg`)
const isEditing = ref(false)
const saving = ref(false)

const userInfo = reactive({
  account: '',
  nickname:'',
  ctime: '',
  gender: '保密',
  avatarUrl: '',
  email: '',
  phone: ''
})

const normalizeAvatar = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${backendBase}${url}`
}

const avatarSrc = computed(() => normalizeAvatar(userInfo.avatarUrl) || defaultAvatar.value)

const formData = reactive({
  account: '',
  nickname:'',
  gender: '保密',
  email: '',
  phone: ''
})

const originalData = reactive({})

onMounted(() => {
  loadUserInfo()
})

// 加载用户信息
const loadUserInfo = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 从 localStorage 获取用户账号
    const token = local.get('user_token')
    if (!token || !token.account) {
      ElMessage.error('未找到用户信息，请重新登录')
      router.push('/login')
      return
    }

    const res = await getUserInfo({ account: token.account })
    
    if (res.code === 0) {
      Object.assign(userInfo, res.data)
      Object.assign(formData, {
        account: res.data.account,
        nickname: res.data.nickname,
        gender: res.data.gender || '保密',
        email: res.data.email || '',
        phone: res.data.phone || ''
      })
      Object.assign(originalData, formData)
    } else {
      ElMessage.error(res.reason || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.close()
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  Object.assign(formData, originalData)
}

// 保存编辑
const saveEdit = async () => {
  // 验证手机号格式
  if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
    ElMessage.error('请输入正确的手机号格式')
    return
  }

  // 验证邮箱格式
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }

  saving.value = true
  
  try {
    const res = await updateUserInfo({
      account: formData.account,
      gender: formData.gender,
      email: formData.email,
      phone: formData.phone
    })

    if (res.code === 0) {
      ElMessage.success('保存成功')
      Object.assign(userInfo, formData)
      Object.assign(originalData, formData)
      isEditing.value = false
    } else {
      ElMessage.error(res.reason || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  console.log(file);
  console.log("11111111111111111");
  
  
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像上传（使用 multipart/form-data 调用后端 uploadavatar）
const handleAvatarUpload = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await request.upload('/account/uploadavatar', formData)
    if (res.code === 0) {
      userInfo.avatarUrl = normalizeAvatar(res.avatarUrl)
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.reason || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.userinfo-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  

  .page-header {
    max-width: 1400px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    gap: 20px;

    .back-btn {
      background: white;
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        background: #f5f5f5;
        transform: translateX(-3px);
      }
    }

    .page-title {
      margin: 0;
      color: white;
      font-size: 32px;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
  }

  .userinfo-content {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 30px;

    // 左侧头像区域
    .avatar-section {
      background: white;
      border-radius: 20px;
      padding: 40px 30px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;

      .avatar-wrapper {
        position: relative;
        margin-bottom: 15px;

        .user-avatar {
          border: 5px solid #f0f0f0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .avatar-uploader {
          position: absolute;
          bottom: 10px;
          right: 10px;

          .upload-btn {
            width: 45px;
            height: 45px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            
            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }

      .avatar-tip {
        color: #999;
        font-size: 13px;
        margin: 0 0 30px 0;
      }

      .user-summary {
        width: 100%;
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;

        h2 {
          margin: 0 0 15px 0;
          font-size: 24px;
          color: #333;
        }

        .join-date {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #666;
          font-size: 14px;
          margin: 0;
        }
      }
    }

    // 右侧信息区域
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .info-card {
        border-radius: 20px;
        border: none;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);

        :deep(.el-card__header) {
          border-bottom: 1px solid #f0f0f0;
          padding: 20px 30px;
        }

        :deep(.el-card__body) {
          padding: 30px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .card-title {
            font-size: 20px;
            font-weight: 600;
            color: #333;
          }

          .edit-actions {
            display: flex;
            gap: 10px;
          }
        }

        .user-form {
          :deep(.el-form-item) {
            margin-bottom: 25px;

            .el-form-item__label {
              font-weight: 600;
              color: #333;
            }

            .el-input__wrapper {
              border-radius: 10px;
              padding: 8px 15px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
              transition: all 0.3s ease;

              &:hover:not(.is-disabled) {
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
              }

              &.is-focus {
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
              }
            }

            .el-radio-group {
              .el-radio {
                margin-right: 20px;

                .el-radio__label {
                  font-size: 15px;
                }
              }
            }
          }
        }
      }

      .stats-card {
        border-radius: 20px;
        border: none;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);

        :deep(.el-card__header) {
          border-bottom: 1px solid #f0f0f0;
          padding: 20px 30px;
        }

        :deep(.el-card__body) {
          padding: 30px;
        }

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }

        .stats-content {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
            border-radius: 15px;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            }

            .stat-info {
              .stat-value {
                margin: 0 0 5px 0;
                font-size: 28px;
                font-weight: 700;
                color: #333;
              }

              .stat-label {
                margin: 0;
                font-size: 14px;
                color: #666;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .userinfo-container {
    .userinfo-content {
      grid-template-columns: 300px 1fr;
      gap: 20px;
    }
  }
}

@media (max-width: 992px) {
  .userinfo-container {
    padding: 15px;

    .page-header {
      margin-bottom: 20px;

      .page-title {
        font-size: 26px;
      }
    }

    .userinfo-content {
      grid-template-columns: 1fr;

      .avatar-section {
        padding: 30px 20px;

        .avatar-wrapper {
          .user-avatar {
            width: 150px;
            height: 150px;
          }
        }
      }

      .info-section {
        .stats-card {
          .stats-content {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .userinfo-container {
    .page-header {
      .page-title {
        font-size: 22px;
      }
    }

    .userinfo-content {
      .info-section {
        .info-card,
        .stats-card {
          :deep(.el-card__header),
          :deep(.el-card__body) {
            padding: 20px;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;

            .edit-actions {
              width: 100%;

              button {
                flex: 1;
              }
            }
          }
        }

        .user-form {
          :deep(.el-form-item__label) {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
