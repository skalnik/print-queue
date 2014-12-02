var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');
var passwordless = require('passwordless');

router.get('/', function (req, res) {
  var locals = { queue: [], errors: req.flash('errors'), message: req.flash('message')[0] };
  QueueItem.all(req.redisKey, function (err, queue) {
    if (err) {
      locals.errors.push(err.message);
    } else {
      locals.queue = queue;
    }
    res.render('index', locals);
  });
});

router.post('/', function (req, res) {
  var errors = [],
    queueItem = new QueueItem(req.body.queue),
    errMsgs = queueItem.errors,
    i;
  if (queueItem && queueItem.valid) {
    req.redis.incr(req.redisKey + ":id", function (err, id) {
      if (err) {
        errors.push("Could not save item: " + err);
        res.redirect('/');
      } else {
        queueItem.id = id;
        req.redis.zadd(req.redisKey, id, JSON.stringify(queueItem), function (err) {
          if (err) { errors.push("Could not save item: " + err); }
        });
      }
    });
  } else {
    for (i = 0; i < errMsgs.length; i++) {
      errors.push(errMsgs[i]);
    }
  }
  if (errors.length > 0) {
    req.flash('errors', errors);
  }
  res.redirect('/');
});

router.post('/requestToken', passwordless.requestToken(function (email, delivery, callback, req) {
  QueueItem.find(req.redis, req.redisKey, req.param('itemId'), function (err, queueItem) {
    if (err) {
      callback(err, null);
    } else {
      if (queueItem.queued) {
        callback(new Error("Can't delete a queued item!"), null);
      } else {
        callback(null, queueItem.id);
      }
    }
  });
}), function (req, res) {
  req.flash('message', 'Check your email for deletion instructions');
  res.redirect('/');
});

router.get('/deleteItem', passwordless.acceptToken(), function (req, res) {
  var redis = req.redis,
    key = req.redisKey,
    itemId = req.itemId;
  if (itemId) {
    QueueItem.find(redis, key, itemId, function (err, queueItem) {
      if (err) {
        req.flash('errors', [err.message]);
        res.redirect('/');
      } else {
        redis.zrem(key, JSON.stringify(queueItem), function (err) {
          if (err) {
            req.flash('errors', [err.message]);
          } else {
            req.flash('message', 'Item deleted!');
          }
          res.redirect('/');
        });
      }
    });
  } else {
    req.flash('errors', ['Could not authenticate successfully']);
    res.redirect('/');
  }
});

module.exports = router;
