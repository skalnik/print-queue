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
  var locals = {
    queue            : [],
    errors           : req.flash('errors'),
    message          : req.flash('message')[0],
    possibleStatuses : QueueItem.statuses
  };
  req.redis.zrange(req.redisKey, 0, -1, function (err, queue) {
    if (err) {
      req.flash('errors', [err.message]);
      res.render('admin');
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

router.patch('/queue/:id', function (req, res) {
  var redis = req.redis,
    key = req.redisKey,
    itemId = req.params.id;
  QueueItem.find(redis, key, itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/admin');
    } else {
      var objKey,
        updatedQueueItem = new QueueItem(JSON.parse(JSON.stringify(queueItem)));
      for (objKey in updatedQueueItem) {
        if (updatedQueueItem.hasOwnProperty(objKey) && // Does the object have this?
            (req.param(objKey) !== null && req.param(objKey) !== undefined) && // Does it exist?
            (updatedQueueItem[objKey] !== req.param(objKey))) { // Is it different?
          updatedQueueItem[objKey] = req.param(objKey);
        }
      }

      if(updatedQueueItem.valid) {
        redis.multi()
          .zrem(key, JSON.stringify(queueItem))
          .zadd(key, updatedQueueItem.id, JSON.stringify(updatedQueueItem))
          .exec(function (err) {
            if (err) {
              req.flash('errors', [err.message]);
            } else {
              req.flash('message', 'Queue Item updated!');
            }
            res.redirect('/admin');
          });
      } else {
        req.flash('errors', updatedQueueItem.errors);
        res.redirect('/admin');
      }

    }
  });
});

router.delete('/queue/:id', function (req, res) {
  var redis = req.redis,
    key = req.redisKey,
    itemId = req.params.id;
  QueueItem.find(redis, key, itemId, function (err, queueItem) {
    if (err) {
      req.flash('errors', [err.message]);
      res.redirect('/admin');
    } else {
      redis.zrem(key, JSON.stringify(queueItem), function (err) {
        if (err) {
          req.flash('errors', [err.message]);
        } else {
          req.flash('message', 'Queue item deleted!');
        }
        res.redirect('/admin');
      });
    }
  });
});

module.exports = router;
