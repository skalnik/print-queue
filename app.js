var express = require('express');
var http = require('http');
var path = require('path');
var level = require('level');

var logger = require('morgan');
var bodyParser = require('body-parser')
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');

var app = express();
var db = level(process.env.DB_PATH || './tmp/db', {valueEncoding: 'json'});
module.exports.router = express.Router();
module.exports.db = db;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Hand all routes the DB
app.use(function(req, res, next) {
  req.db = db;
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
