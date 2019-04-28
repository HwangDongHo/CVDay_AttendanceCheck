var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var mainRouter = require('./routes/main');
var adminRouter = require('./routes/admin');

var app = express();

var bodyParser = require('body-parser');

var session = require('express-session');

app.use(session({
  secret: 'keyboard cat',
  resave:false,
  saveUninitialized :true,
  cookie: {
    maxAge: 24000 * 60 * 60 * 365 // 쿠키 유효기간 24시간
  }
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,'node_modules')));

app.use('/', indexRouter);
app.use('/', mainRouter);
app.use('/', adminRouter);


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

module.exports = app;

