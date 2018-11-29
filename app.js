const createError = require('http-errors'),
express = require('express'),
app = express(),
path = require('path'),
cookieParser = require('cookie-parser'),
logger = require('morgan'),
server= require('http').createServer(app),
indexRouter = require('./routes/index'),
authRouter = require('./routes/auth')(app),
SOCKETIO=require('./lib/socketio.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/auth',express.static(path.join(__dirname, 'public')));
app.use('/auth',express.static(path.join(__dirname, 'img')));
app.use('/contents/:category/page',express.static(path.join(__dirname, 'public')));
app.use('/contents/:category/room',express.static(path.join(__dirname, 'public')));
app.use('/contents/:category/makeRoom',express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(80);
SOCKETIO(server,app);

module.exports = app;
