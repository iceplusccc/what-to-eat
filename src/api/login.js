/* 
 *  登录模块api
*/

//引入请求文件
import axios from "../utils/request";


export function checkLogin(params){
    return axios.post("/login/checklogin" ,params)
}

// 发送邮箱验证码
export function sendEmailCode(params){
    return axios.post('/login/sendEmailCode', params)
}

// 邮箱验证码注册
export function registerWithEmail(params){
    return axios.post('/login/registerWithEmail', params)
}