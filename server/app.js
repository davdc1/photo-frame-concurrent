require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');

var userRouter = require('./routes/user')
var photoRouter = require('./routes/photo')
var albumRouter = require('./routes/album')
var llmRouter = require('./routes/llm')
var textRouter = require('./routes/text')

var app = express();
// const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
const CORS_ORIGIN = 'http://localhost:3000'

app.use(cors({ origin: CORS_ORIGIN, credentials: true }))

// app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
// app.use(cors({ origin: 'http://10.0.0.19:3000', credentials: true })) // for connecting localy from iphone. 10.0.0.19- mac local ip



require('./data/connect')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/views', express.static(path.join(__dirname, 'public/views')));

// app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/photos', photoRouter);
app.use('/albums', albumRouter)
app.use('/llm', llmRouter)
app.use('/texts', textRouter)

// SPA catch-all — serve React app for any unmatched route
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

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
  res.send('error');
});

module.exports = app;
