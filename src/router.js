import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: "/",
        redirect: "/login"
    },
    {
        path: "/login", 
        component: () => import("./views/login.vue")
    },
    {
        path:"/section",
        component : () => import("./views/section.vue")
    },
    {
        path: "/userinfo",
        component: () => import("./views/userinfo.vue")
    },
    {
        path: "/modify-password",
        component: () => import("./views/modifyPassword.vue")
    },
    {
        path: "/random-select",
        component: () => import("./views/RandomSelect.vue")
    },
    {
        path: "/diy",
        component: () => import("./views/DIY.vue")
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router