var express = require('express');
var http = require('http');
var path = require('path');
var redis = require('redis');

var logger = require('morgan');
var bodyParser = require('body-parser')
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');

var app = express();
module.exports.router = express.Router();
var redisURL = process.env.BOXEN_URL || process.env.REDISTOGO_URL;
var redisClient;
if(redisURL) {
  var url = require('url').parse(redisURL);
  redisClient = redis.createClient(url.port, url.hostname);
  if(url.auth) {
    redisClient.auth(url.auth.split(":")[1]);
  }
}
else {
  redisClient = redis.createClient();
}

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Hand all routes the DB & password
app.use(function(req, res, next) {
  req.redis = redisClient;
  req.redisKey = 'skalnik:print-queue';
  req.password = process.env.PASSWORD || 'butts'
  next();
});

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

var user = require('./routes');
var admin = require('./routes/admin.js');

app.use('/', user);
app.use('/admin', admin);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
