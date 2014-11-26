var express = require('express');
var router = express.Router();
var auth = require('basic-auth');
var QueueItem = require('../lib/queueItem.js');

router.all('*', function (req, res, next) {
  var user = auth(req);
  if (user === undefined || user.pass !== req.password) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
    res.end('Unauthorized');
  } else {
    next();
  }
});

router.get('/', function (req, res) {
  var locals = { queue: [], errors: req.flash('errors'), message: req.flash('message')[0] };
  req.redis.zrange(req.redisKey, 0, -1, function (err, queue) {
    if (err) {
      res.render('error', { error: err });
    } else {
      locals.queue = queue.map(function (item) {
        return new QueueItem(JSON.parse(item));
      });
      res.render('admin', locals);
    }
  });
});

router.delete('/queue', function (req, res) {
  req.redis.del(req.redisKey);
  res.redirect('/admin');
});

router.delete('/queue/:id', function (req, res) {
  var redis = req.redis,
    key = req.redisKey,
    itemId = req.params.id;
  redis.zrangebyscore(key, itemId, itemId, function (err, queueItems) {
    if (err) {
      req.flash('errors', "Couldn't find item to delete");
      res.redirect('/admin');
    } else {
      if (queueItems.length > 1) {
        req.flash('errors', 'Found more than one item for that ID');
      }
      var queueItem = new QueueItem(JSON.parse(queueItems[0]));
      // Delete the item
      redis.zrem(key, JSON.stringify(queueItem), function (err) {
        if (err) {
          req.flash('errors', [err]);
        } else {
          req.flash('message', 'Queue item deleted!');
        }
        res.redirect('/admin');
      });
    }
  });
});

module.exports = router;
