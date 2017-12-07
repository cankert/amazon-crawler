var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');
var index = require('./routes/index');
var product = require('./routes/product');
var mail = require('./routes/mail');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/amazon');
var app = express();
var cron = require('node-cron');
var restler = require('restler');
const notifier = require('node-notifier');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', index);
app.use('/product', product);
app.use('/mail', mail);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
var currentDate = new Date ();
var task = cron.schedule('*/5 * * * *', function(){
    console.log(currentDate+' : Scheduler Task every 5 minutes.');
    var getResp = function(url){
        restler.get(url).on('complete', function(response){
            //console.log('Called API');
            notifier.notify({
                'title': 'Amazon Crawler',
                'message': 'Running Update',
                'wait':true,
                'sound':'Pop'
            });

        });
    };
    getResp('http://localhost:3000/product/update');
}, true);

module.exports = app;
