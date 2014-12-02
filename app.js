var express          = require('express'),
  path               = require('path'),
  logger             = require('morgan'),
  bodyParser         = require('body-parser'),
  methodOverride     = require('method-override'),
  flash              = require('connect-flash'),
  session            = require('express-session'),
  handlebars         = require('express-handlebars'),
  passwordless       = require('passwordless'),
  RedisSessionStore  = require('connect-redis')(session),
  RedisPasswordStore = require('passwordless-redisstore');


var redis = require('./lib/redis');

var handlebarHelpers = {
  equal: function (a, b, options) {
    if (a === b) {
      return options.fn(this);
    }
    return options.inverse(this);
  }
};

// Setup express
var app = express();
module.exports.router = express.Router();

app.engine('handlebars', handlebars({ defaultLayout: 'layout', helpers: handlebarHelpers }));

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.set('host', process.env.HOST || "http://localhost:" + app.get('port'));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
  store:             new RedisSessionStore({ client: redis }),
  saveUninitialized: false,
  resave:            false,
  secret:            process.env.SESSION_SECRET || 'giro is a cat'
}));

require('./lib/passwordless')(app);

// A small middleware to give all the routes access to DB & admin password
app.use(function (req, res, next) {
  req.redis = redis;
  req.redisKey = 'skalnik:print-queue';
  req.password = process.env.PASSWORD || 'butts';
  next();
});

// Done setting things up, lets start the server
require('./server')(app);
