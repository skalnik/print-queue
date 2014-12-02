var express          = require('express'),
  path               = require('path'),
  logger             = require('morgan'),
  bodyParser         = require('body-parser'),
  methodOverride     = require('method-override'),
  flash              = require('connect-flash'),
  session            = require('express-session'),
  handlebars         = require('express-handlebars'),
  passwordless       = require('passwordless'),
  email              = require('postmark')(process.env.POSTMARK_API_KEY),
  redis              = require('redis'),
  RedisSessionStore  = require('connect-redis')(session),
  RedisPasswordStore = require('passwordless-redisstore');

// Setup redis for session store, general DB usage, and passwordless storage
var redisURL = process.env.BOXEN_REDIS_URL || process.env.REDISCLOUD_URL || process.env.REDIS_URL,
  db,
  passwordlessStore;

if (redisURL) {
  var url = require('url').parse(redisURL),
    options = {};

  if (url.auth) {
    options = { auth_pass: url.auth.split(":")[1] };
  }

  db = redis.createClient(url.port, url.hostname, options);
  passwordlessStore = new RedisPasswordStore(url.port, url.hostname, options);
} else {
  db = redis.createClient();
  passwordlessStore = new RedisPasswordStore();
}

// Setup express
var app = express();
module.exports.router = express.Router();

app.engine('handlebars', handlebars({ defaultLayout: 'layout' }));

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
  store:             new RedisSessionStore({ client: db }),
  saveUninitialized: false,
  resave:            false,
  secret:            process.env.SESSION_SECRET || 'giro is a cat'
}));

// Setup passwordless
passwordless.init(passwordlessStore, { userProperty: 'itemId' });
passwordless.addDelivery(function (token, uid, recipient, callback) {
  var url, msg;
  url = app.get('host') + "/deleteItem/?token=" + token + "&uid=" + encodeURIComponent(uid);
  msg = {
    "From": "print.queue@mikeskalnik.com",
    "To": recipient,
    "Subject": "Your Print Queue Item Deletion URL",
    "TextBody": "Hello,\n\nTo delete your Print Queue item click here: " + url
  };
  email.send(msg, function (err) {
    if (err) {
      console.log("Failed to send message: ", msg);
      console.log(err);
    } else {
      console.log("Successfully sent message: ", msg);
    }
    callback();
  });
});

// A small middleware to give all the routes access to DB & admin password
app.use(function (req, res, next) {
  req.redis = db;
  req.redisKey = 'skalnik:print-queue';
  req.password = process.env.PASSWORD || 'butts';
  next();
});

// Done setting things up, lets start the server
require('./server')(app);
