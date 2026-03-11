/*
 *axios请求封装
*/

//引入axios
import axios from "axios";

//引入qs
import qs from "qs";

//引入本地存储封装
import local from "../utils/local";


// 默认服务器地址（优先读取部署环境变量）
const normalizeBaseUrl = (url) => {
    if (!url || typeof url !== 'string') return "http://127.0.0.1:5000";
    const trimmed = url.trim();
    if (!trimmed) return "http://127.0.0.1:5000";

    // Railway 常见误配：只填域名未带协议
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return withProtocol.replace(/\/+$/, '');
}

const API_BASE_URL = normalizeBaseUrl(process.env.VUE_APP_API_BASE_URL);
axios.defaults.baseURL = API_BASE_URL;

/* 
    axios请求拦截器： 
        在axios发送请求之前，把它拦截，让他先携带一点东西
        再发出请求。
*/ 

axios.interceptors.request.use(function(config) {
    // 获取 token；登录时我们存的是 { token, account }
    const stored = local.get("user_token");
    const bearerToken = typeof stored === 'string' ? stored : stored?.token;
    if (typeof bearerToken === 'string' && bearerToken.trim()) {
        config.headers.authorization = `Bearer ${bearerToken}`;
    }
    return config;
})

//暴露出去
export default {
    get(url,params={}){
        return new Promise( (resolve,reject) => {
             axios.get(url,{params})
             .then(response => {
                 resolve(response.data)
             })
             .catch(err => {
                 reject(err)
             })
        })
    },
    post(url,params={}){
        return new Promise( (resolve,reject) => {
            axios.post(url,qs.stringify(params))
            .then(response => {
                resolve(response.data)
            })
            .catch(err => {
                reject(err)
            })
       })
    },
    // 上传文件专用，保持 form-data，不再 qs 序列化
    upload(url, formData = {}) {
        return new Promise((resolve, reject) => {
            axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            .then(response => resolve(response.data))
            .catch(err => reject(err))
        })
    }
}

