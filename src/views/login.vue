<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-overlay"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo-section">
          <img src="../assets/images/icon1.png" alt="Logo" class="logo-img">
          <h1 class="app-title">What to eat?</h1>
        </div>
        <p class="welcome-text">探索美食，享受生活</p>
      </div>

      <div class="login-content">
        <el-tabs v-model="activeName" @tab-click="handleClick()" class="login-tabs">
          <el-tab-pane label="登录" name="first">
            <el-form 
              :model="ruleForm" 
              :rules="rules" 
              ref="ruleFormRef" 
              class="login-form"
              label-position="top"
            >
              <el-form-item label="用户名或邮箱" prop="username">
                <el-input 
                  v-model="ruleForm.username" 
                  placeholder="请输入用户名或邮箱"
                  size="large"
                  prefix-icon="User"
                  clearable
                />
              </el-form-item>
              <el-form-item label="密码" prop="pass">
                <el-input 
                  v-model="ruleForm.pass" 
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                  autocomplete="off"
                />
              </el-form-item>
              <el-form-item class="form-actions">
                <el-button 
                  type="primary" 
                  size="large"
                  class="submit-btn"
                  @click="submitForm('ruleForm')"
                  :loading="loading"
                >
                  登录
                </el-button>
                <el-button 
                  size="large"
                  class="reset-btn"
                  @click="resetForm('ruleForm')"
                >
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="注册" name="second">
            <el-form 
              :model="ruleForm2" 
              :rules="rules" 
              ref="ruleForm2Ref" 
              class="login-form"
              label-position="top"
            >
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="ruleForm2.username" 
                  placeholder="请输入用户名"
                  size="large"
                  prefix-icon="User"
                  clearable
                />
              </el-form-item>
              <el-form-item label="邮箱（可选）" prop="email">
                <el-input 
                  v-model="ruleForm2.email" 
                  placeholder="请输入邮箱，用于找回密码等"
                  size="large"
                  prefix-icon="Message"
                  clearable
                />
              </el-form-item>
              <el-form-item label="密码" prop="pass">
                <el-input 
                  v-model="ruleForm2.pass" 
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                  autocomplete="off"
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="checkPass">
                <el-input 
                  v-model="ruleForm2.checkPass" 
                  type="password"
                  placeholder="请再次输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                  autocomplete="off"
                />
              </el-form-item>
              <div class="email-register">
                <el-alert type="info" show-icon :closable="false" title="你也可以使用邮箱验证码注册" />
                <div class="email-code-row">
                  <el-input v-model="emailCode" placeholder="输入邮箱验证码" size="large" style="flex:1" />
                  <el-button size="large" @click="sendCode" :loading="codeSending" style="margin-left:8px">发送验证码</el-button>
                </div>
                <el-button type="primary" size="large" class="submit-btn" @click="submitEmailRegister" :loading="loading" style="margin-top:8px">
                  邮箱验证码注册
                </el-button>
              </div>
              <el-form-item class="form-actions">
                <el-button 
                  type="primary" 
                  size="large"
                  class="submit-btn"
                  @click="submitForm('ruleForm2')"
                  :loading="loading"
                >
                  注册
                </el-button>
                <el-button 
                  size="large"
                  class="reset-btn"
                  @click="resetForm('ruleForm2')"
                >
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="login-footer">
        <p>© 2025 What to eat? All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
//引入本地存贮函数
import local from "../utils/local";
//引入登录模块api
import { checkLogin, sendEmailCode, registerWithEmail } from "../api/login"
import {accountAdd} from "../api/account"


onMounted(() => {
  // 隐藏页面滚动条，仅针对本页面生命周期
  try {
    prevBodyOverflow.value = document.body.style.overflow;
    prevHtmlOverflow.value = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  } catch (e) {}
})

onUnmounted(() => {
  // 恢复页面滚动条
  try {
    document.body.style.overflow = prevBodyOverflow.value || '';
    document.documentElement.style.overflow = prevHtmlOverflow.value || '';
  } catch (e) {}
})

const prevBodyOverflow = ref('')
const prevHtmlOverflow = ref('')

const router = useRouter()

const activeName = ref('first')
const ruleFormRef = ref(null)
const ruleForm2Ref = ref(null)
const loading = ref(false)

const ruleForm = reactive({
  pass: '',
  username: ''
})

const ruleForm2 = reactive({
  pass: '',
  checkPass: '',
  username: '',
  email: ''
})
const emailCode = ref('')
const codeSending = ref(false)

const validateUsername = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入用户名'));
  }
  callback()
}

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (ruleForm2.checkPass !== '') {
      ruleForm2Ref.value.validateField('checkPass');
    }
    callback();
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== ruleForm2.pass) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
}

const rules = reactive({
  username:[
    {validator:validateUsername,trigger:'blur'}
  ],
  email: [
    { validator: (rule, value, cb) => {
        if(!value) return cb();
        const ok = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)
        ok ? cb() : cb(new Error('邮箱格式不正确'))
      }, trigger: 'blur' }
  ],
  pass: [
    { validator: validatePass, trigger: 'blur' }
  ],
  checkPass: [
    { validator: validatePass2, trigger: 'blur' }
  ],
})

onMounted(() => {
  local.save("user_token", {});
})

const handleClick = () => {
  if (activeName.value === ' ') {
    ruleForm2Ref.value?.resetFields();
  }
  else {
    ruleFormRef.value?.resetFields();
  }
}

const submitForm = (formName) => {
  const formRef = formName === 'ruleForm' ? ruleFormRef.value : ruleForm2Ref.value
  
  formRef.validate((valid) => {
    if (valid && formName === 'ruleForm') {
      loading.value = true
      let params = {
        account: ruleForm.username,
        password: ruleForm.pass
      }
      
      checkLogin(params)
        .then(res => {
          //接收响应参数
          let { code, reason, token, account } = res;
          if(token == undefined){
            token = {}
          }
          
          //判断
          if (code === 0) {//成功
            const realAccount = account || ruleForm.username;
            //将token和账号信息放入本地存贮
            local.save("user_token", { token, account: realAccount });
            
            ElMessage({
              type: "success",
              message: reason
            })

            //跳转到主页
            router.push("/section");
          } else if (code === 1) {//失败
            ElMessage.error(reason);
          }
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          loading.value = false
        })
    }
    else if (valid && formName === 'ruleForm2') {
      loading.value = true
      let params = {
        account: ruleForm2.username,
        password: ruleForm2.pass,
        email: ruleForm2.email || undefined,
      }
      
      accountAdd(params).then(res => {
        let { code, reason } = res;

        if (code === 0) {//成功
          ElMessage({
            type: "success",
            message: reason
          });
          ruleForm2Ref.value.resetFields();
          activeName.value = 'first'
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        loading.value = false
      })
    }
    else {
      console.log('error submit!!');
      return false;
    }
  });
}

// 发送邮箱验证码（提到顶层，避免嵌套函数导致语法问题）
const sendCode = async () => {
  if(!ruleForm2.email){
    ElMessage.error('请先填写邮箱')
    return
  }
  codeSending.value = true
  try{
    const res = await sendEmailCode({ email: ruleForm2.email })
    const payload = res || {}
    if(payload.code === 0){
      ElMessage.success('验证码已发送（开发环境返回 devCode）')
      if(payload.devCode){
        emailCode.value = payload.devCode
        console.log('devCode:', payload.devCode)
      }
    }else{
      ElMessage.error(payload.reason || '发送失败')
    }
  }catch(e){
    console.error(e)
    ElMessage.error('发送失败')
  }finally{
    codeSending.value = false
  }
}

// 邮箱验证码注册（顶层）
const submitEmailRegister = async () => {
  if(!ruleForm2.username || !ruleForm2.pass || !ruleForm2.email || !emailCode.value){
    ElMessage.error('请完整填写用户名、密码、邮箱与验证码')
    return
  }
  loading.value = true
  try{
    const res = await registerWithEmail({
      account: ruleForm2.username,
      password: ruleForm2.pass,
      email: ruleForm2.email,
      code: emailCode.value
    })
    const payload = res || {}
    if(payload.code === 0){
      ElMessage.success('注册成功')
      ruleForm2Ref.value.resetFields();
      emailCode.value = ''
      activeName.value = 'first'
    }else{
      ElMessage.error(payload.reason || '注册失败')
    }
  }catch(e){
    console.error(e)
    ElMessage.error('注册失败')
  }finally{
    loading.value = false
  }
}
const resetForm = (formName) => {
  const formRef = formName === 'ruleForm' ? ruleFormRef.value : ruleForm2Ref.value
  formRef.resetFields();
}
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url(../assets/images/bg5.jpg) no-repeat center center;
    background-size:cover;
    // filter: blur(3px);
    // transform: scale(1.1);
    z-index: 0;

    .background-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      // background: linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%);
    }
  }

  .login-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    backdrop-filter: blur(10px);
    animation: slideUp 0.5s ease-out;

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      padding: 40px 40px 20px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      .logo-section {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;

        .logo-img {
          width: 80px;
          height: 60px;
          margin-right: 15px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .app-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 1px;
        }
      }

      .welcome-text {
        font-size: 15px;
        opacity: 0.95;
        margin: 0;
        font-weight: 300;
      }
    }

    .login-content {
      padding: 40px 40px 20px;

      .login-form {
        .form-actions {
          margin-top: 30px;

          :deep(.el-form-item__content) {
            display: flex;
            gap: 12px;

            .submit-btn {
              flex: 1;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: none;
              font-weight: 600;
              height: 44px;
              border-radius: 12px;
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
              }

              &:active {
                transform: translateY(0);
              }
            }

            .reset-btn {
              flex: 0.6;
              height: 44px;
              border-radius: 12px;
              border: 2px solid #e0e0e0;
              transition: all 0.3s ease;

              &:hover {
                border-color: #667eea;
                color: #667eea;
                background: rgba(102, 126, 234, 0.05);
              }
            }
          }
        }
      }
    }

    .login-footer {
      padding: 20px 40px;
      text-align: center;
      color: #999;
      font-size: 13px;
      border-top: 1px solid #f0f0f0;

      p {
        margin: 0;
      }
    }
  }
}

// Element Plus 样式覆盖
:deep(.login-tabs) {
  .el-tabs__header {
    margin: 0 0 30px 0;
  }

  .el-tabs__nav-wrap {
    &::after {
      display: none;
    }
  }

  .el-tabs__nav {
    width: 100%;
    display: flex;
  }

  .el-tabs__item {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    height: 50px;
    line-height: 50px;
    color: #999;
    transition: all 0.3s ease;

    &:hover {
      color: #667eea;
    }

    &.is-active {
      color: #667eea;
    }
  }

  .el-tabs__active-bar {
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 24px;

  .el-form-item__label {
    color: #333;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
    padding: 0;
  }

  .el-input__wrapper {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 8px 15px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    &.is-focus {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
    }
  }

  .el-input__inner {
    font-size: 15px;
  }

  .el-input__prefix {
    font-size: 18px;
    color: #999;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 10px;

    .login-card {
      max-width: 100%;
      border-radius: 16px;

      .login-header {
        padding: 30px 20px 15px;

        .logo-section {
          .logo-img {
            width: 50px;
            height: 50px;
            margin-right: 10px;
          }

          .app-title {
            font-size: 26px;
          }
        }

        .welcome-text {
          font-size: 14px;
        }
      }

      .login-content {
        padding: 30px 20px 15px;
      }

      .login-footer {
        padding: 15px 20px;
        font-size: 12px;
      }
    }
  }

  :deep(.login-tabs) {
    .el-tabs__item {
      font-size: 16px;
      height: 44px;
      line-height: 44px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;

    .el-form-item__label {
      font-size: 13px;
    }

    .el-input__wrapper {
      padding: 6px 12px;
    }

    .el-input__inner {
      font-size: 14px;
    }
  }
}

@media (max-width: 480px) {
  .login-container {
    .login-card {
      .login-header {
        .logo-section {
          flex-direction: column;
          gap: 10px;

          .logo-img {
            margin-right: 0;
          }
        }
      }
    }
  }

  :deep(.el-form-item) {
    .form-actions {
      :deep(.el-form-item__content) {
        flex-direction: column;

        .submit-btn,
        .reset-btn {
          width: 100%;
        }
      }
    }
  }
}

// 暗黑模式支持
@media (prefers-color-scheme: dark) {
  .login-container {
    .login-card {
      background: rgba(30, 30, 30, 0.95);

      .login-content {
        :deep(.el-form-item__label) {
          color: #e0e0e0;
        }
      }

      .login-footer {
        color: #666;
        border-top-color: #333;
      }
    }
  }
}
</style>