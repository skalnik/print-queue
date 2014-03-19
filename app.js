var express = require('express');
var http = require('http');
var path = require('path');
var level = require('level');
var app = module.exports = express();

var db = level(process.env.DB_PATH || './tmp/db');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('db', db);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var user = require('./routes/public.js');
var admin = require('./routes/admin.js');
var auth = express.basicAuth('admin', process.env.PASSWORD || 'butts');

app.get('/', user.index);
app.post('/', user.index);
app.get('/clear', auth, admin.clear);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
