import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import "./assets/reset.css"//引入重置样式
import "./assets/common.css"//引入共用样式
import "./assets/font/iconfont/iconfont.css"//引入图标样式

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// import Echarts from "echarts";//引入echarts

import local from "./utils/local"

//路由守卫 -- 拦截所有路由
router.beforeEach( (to,from,next) => {
    //获取token
    let token = local.get("user_token");

    //判断
    if(token){//如果有令牌，放行
       next()
    }else{
       if(to.path === "/login"){ //如果去登录页面 -- 放行
          next();
       }else{//如果去其他页面 -- 直接跳转到登录页面
          next({path:"/login"})
       }
    }
})

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')

