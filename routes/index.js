var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');

router.get('/', function (req, res) {
  var locals = { queue: [], errors: req.flash('errors') };
  req.redis.zrange(req.redisKey, 0, -1, function (err, queue) {
    if (err) {
      res.render('error', { error: err });
    } else {
      locals.queue = queue.map(function (item) {
        return new QueueItem(JSON.parse(item));
      });
      res.render('index', locals);
    }
  });
});

router.post('/', function (req, res) {
  var errors = [],
    queueItem = new QueueItem(req.body.queue),
    errMsgs = queueItem.errors(),
    i;
  if (queueItem && queueItem.valid()) {
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
  res.redirect('/');
});

module.exports = router;
