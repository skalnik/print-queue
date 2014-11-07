var express = require('express');
var router = express.Router();
var auth = require('basic-auth');
var QueueItem = require('../lib/queueItem.js');

router.all('*', function(req, res, next) {
  user = auth(req);
  if (user === undefined || user['pass'] !== req.password) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
      res.end('Unauthorized');
  } else {
    next();
  }
});

router.get('/', function(req, res) {
  var locals = {queue: [], errors: req.flash('errors') }
  req.redis.zrange(req.redisKey, 0, -1, function(err, queue) {
    if(err) { res.render('error', { error: err }) }
    else {
      locals.queue = queue.map(function(item) {
        return new QueueItem(JSON.parse(item));
      });
      res.render('admin', locals);
    }
  });
});

router.delete('/queue', function(req, res) {
  req.redis.del(req.redisKey);
  res.redirect('/admin');
});

router.delete('/queue/:id', function(req, res) {
  req.flash('errors', ['Not implemented yet']);
  res.redirect('/admin');
});

module.exports = router;
