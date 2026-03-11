var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var accountRouter = require('./routes/account');//用户管理
var loginRouter = require('./routes/login');//用户管理
var recommendationRouter = require('./routes/recommendation');//随机推荐
var diyRouter = require('./routes/diy');//DIY菜谱
var cors = require('cors'); // 引入cors模块
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors()); // 注入cors模块解决跨域
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//分配子路由
app.use('/account', accountRouter);//用户管理
app.use('/login', loginRouter);//登录
app.use('/recommendation', recommendationRouter);//随机推荐
app.use('/diy', diyRouter);//DIY菜谱
app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', ['mytoken','Content-Type']);
	next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//监听端口
app.listen(5000, () =>{
    console.log("服务器启动成功：http://127.0.0.1:5000");
})
module.exports = app;
