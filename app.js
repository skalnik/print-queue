var express         = require('express'),
  path              = require('path'),
  logger            = require('morgan'),
  bodyParser        = require('body-parser'),
  methodOverride    = require('method-override'),
  flash             = require('connect-flash'),
  session           = require('express-session'),
  redis             = require('redis'),
  RedisSessionStore = require('connect-redis')(session);

// Setup redis for session store & general DB usage
var redisURL = process.env.BOXEN_REDIS_URL || process.env.REDISCLOUD_URL || process.env.REDIS_URL;
var db;

if (redisURL) {
  var url = require('url').parse(redisURL);
  db = redis.createClient(url.port, url.hostname);

  if (url.auth) {
    db.auth(url.auth.split(":")[1]);
  }
} else {
  db = redis.createClient();
}

// Setup express
var app = express();
module.exports.router = express.Router();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
  store:             new RedisSessionStore({client: db}),
  saveUninitialized: false,
  resave:            false,
  secret:            process.env.SESSION_SECRET || 'giro is a cat'
}));


// A small middleware to give all the routes access to DB & admin password
app.use(function (req, res, next) {
  req.redis = db;
  req.redisKey = 'skalnik:print-queue';
  req.password = process.env.PASSWORD || 'butts';
  next();
});

// Done setting things up, lets start the server
require('./server')(app);
