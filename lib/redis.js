var redis = require('redis'),
  redisURL = process.env.BOXEN_REDIS_URL || process.env.REDISCLOUD_URL || process.env.REDIS_URL,
  db;

if (redisURL) {
  var url = require('url').parse(redisURL),
    options = {};

  if (url.auth) {
    options = { auth_pass: url.auth.split(":")[1] };
  }

  db = redis.createClient(url.port, url.hostname, options);
} else {
  db = redis.createClient();
}

module.exports = db;
