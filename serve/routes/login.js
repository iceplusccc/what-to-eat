var express = require('express');
var router = express.Router();

let connection = require("./js/mysql");//引入操作mysql模块

const jwt= require('jsonwebtoken');//引入token

const secret = 'itsource';//定义秘钥

/* -----  拦截所有请求 请求中必须携带token（令牌才响应数据 否则响应错误信息）-------- */ 
const expressJwt = require('express-jwt'); // 引入检查token的模块


// 检查token合法性 如果不合法 就会抛出错误哦
router.use(expressJwt ({
    secret
}).unless({
    // 在路由挂载后，这里匹配的是 /sendEmailCode 这类路径
    path: [
        '/checklogin',
        '/sendEmailCode',
        '/registerWithEmail',
        // 兼容使用 originalUrl 的情况
        '/login/checklogin',
        '/login/sendEmailCode',
        '/login/registerWithEmail'
    ]
}))

// //拦截器
router.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {   
        // 响应错误状态码 和 错误信息
        res.status(401).send('token无效，你的请求要携带正确的token才能获取到数据哦！');
    }
})
/*------ 拦截请求结束 ------*/

//解决跨域问题
router.all("*", (req,res,next) => {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers", "authorization, content-type");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();//放行
})

//检查登录
router.post("/checklogin", (req,res) => {
    let {account,password} = req.body || {};
    if(!account || !password){
        return res.send({ code:1 , reason: "账号或密码不能为空"});
    }

    // 允许使用用户名或邮箱登录
    const sqlStr = `SELECT * FROM accounts WHERE (account = ? OR email = ?) AND password = ? LIMIT 1`;
    connection.query(sqlStr, [account, account, password], (err, data) => {
        if(err){
            console.error('登录查询失败:', err);
            return res.send({ code:1 , reason: "查询失败"});
        }

        if(data && data.length){
            const token = jwt.sign(Object.assign({},data[0]), secret, { expiresIn:  60 * 60 * 2 });
            res.send({
                code: 0,
                reason: "登录成功",
                token,
                account: data[0].account,
                email: data[0].email || ''
            });
        }else{
            res.send({ code:1 , reason: "请确认用户名/邮箱与密码"});
        }
    })
})

// 简易邮箱验证码存储（内存）
const emailCodeStore = new Map(); // key: email, value: { code, expiresAt }

// 发送邮箱验证码（开发环境：若未配置SMTP，将直接返回验证码方便调试）
router.post('/sendEmailCode', async (req, res) => {
    const { email } = req.body || {};
    if(!email){
        return res.send({ code:1, reason: '邮箱不能为空' });
    }
    // 简单校验邮箱格式
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if(!emailRegex.test(email)){
        return res.send({ code:1, reason: '邮箱格式不正确' });
    }

    // 生成6位验证码
    const code = String(Math.floor(100000 + Math.random()*900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟
    emailCodeStore.set(email, { code, expiresAt });

    try{
        // 若配置了SMTP，可在此处实际发送邮件（可选）
        // 这里为了最小改动，不引入额外依赖，直接返回验证码用于调试
        return res.send({ code:0, reason:'验证码已生成', devCode: code });
    }catch(e){
        console.error('发送邮箱验证码失败:', e);
        return res.send({ code:1, reason:'发送失败' });
    }
})

// 邮箱验证码注册
router.post('/registerWithEmail', (req, res) => {
    const { account, password, email, code } = req.body || {};
    if(!account || !password || !email || !code){
        return res.send({ code:1, reason:'账号/密码/邮箱/验证码均不能为空' });
    }
    const rec = emailCodeStore.get(email);
    if(!rec || rec.code !== code || Date.now() > rec.expiresAt){
        return res.send({ code:1, reason:'验证码无效或已过期' });
    }

    // 查重（用户名或邮箱）
    const checkSql = `SELECT id FROM accounts WHERE account = ? OR email = ? LIMIT 1`;
    connection.query(checkSql, [account, email], (err, rows) => {
        if(err){
            console.error('注册查重失败:', err);
            return res.send({ code:1, reason:'校验失败' });
        }
        if(rows && rows.length){
            return res.send({ code:1, reason:'账号或邮箱已存在' });
        }

        const insertSql = `INSERT INTO accounts (account, password, email, ctime, avatarUrl) VALUES (?, ?, ?, NOW(), '/upload/portrait.jpg')`;
        connection.query(insertSql, [account, password, email], (err2) => {
            if(err2){
                console.error('注册失败:', err2);
                return res.send({ code:1, reason:'注册失败' });
            }
            // 注册成功后清理验证码
            emailCodeStore.delete(email);
            return res.send({ code:0, reason:'注册成功' });
        })
    })
})

module.exports = router;