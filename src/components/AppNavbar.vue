<template>
  <nav class="navbar">
    <div class="navbar-brand" @click="$emit('brand-click')">
      <img src="../assets/images/icon1.png" alt="Logo" class="logo" />
      <span class="brand-text">What to eat?</span>
    </div>

    <div class="navbar-search">
      <el-input v-model="search" placeholder="搜索美食..." size="large" clearable>
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button :icon="Search" @click="onSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div class="navbar-user">
      <el-dropdown @command="onCommand" trigger="click">
        <div class="user-avatar-wrapper">
          <el-avatar :size="45" :src="avatarSrc" class="user-avatar" />
          <span class="username">{{ username || '用户' }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { Search, User, Lock, SwitchButton } from '@element-plus/icons-vue'

const props = defineProps({
  username: { type: String, default: '用户' },
  avatarSrc: { type: String, default: '' },
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'search', 'command', 'brand-click'])

const search = ref(props.modelValue)
watchEffect(() => {
  search.value = props.modelValue
})

const onSearch = () => {
  emit('search', search.value)
}

const onCommand = (cmd) => {
  emit('command', cmd)
}
</script>

<style lang="scss" scoped>
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

    &:hover { transform: scale(1.05); }

    .logo { width: 60px; height: 45px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

    .brand-text {
      font-size: 24px; font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .navbar-search {
    flex: 1; max-width: 500px; margin: 0 40px;

    :deep(.el-input__wrapper) {
      border-radius: 25px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      padding: 5px 15px; transition: all 0.3s ease;
      &:hover { box-shadow: 0 4px 16px rgba(102,126,234,0.2); }
    }

    :deep(.el-input-group__append) {
      border-radius: 0 25px 25px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      .el-button { background: transparent; border: none; color: white; font-weight: 600; }
      .el-button:hover { background: rgba(255, 255, 255, 0.1); }
    }
  }

  .navbar-user {
    .user-avatar-wrapper {
      display: flex; align-items: center; gap: 12px; padding: 8px 16px;
      border-radius: 30px; cursor: pointer; transition: all 0.3s ease;
      background: rgba(102, 126, 234, 0.05);
      &:hover { background: rgba(102, 126, 234, 0.15); transform: translateY(-2px); }

      .user-avatar { border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
      .user-avatar:hover { transform: scale(1.1); }

      .username { font-weight: 600; color: #333; font-size: 15px; }
    }
  }
}
</style>
