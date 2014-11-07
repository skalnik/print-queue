var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');

router.get('/', function(req, res) {
  var locals = {queue: [], errors: req.flash('errors') }
  req.redis.zrange(req.redisKey, 0, -1, function(err, queue) {
    if(err) { res.render('error', { error: err }) }
    else {
      locals.queue = queue.map(function(item) {
        return new QueueItem(JSON.parse(item));
      });
      res.render('index', locals);
    }
  });
});

router.post('/', function(req, res) {
  var errors = []
  var queueItem = new QueueItem(req.body.queue);
  if(queueItem && queueItem.valid()) {
    req.redis.zadd(req.redisKey, queueItem.timestamp, JSON.stringify(queueItem), function(err) {
      if(err) { errors.push("Could not save item: " + err); }
    });
  }
  else {
    errMsgs = queueItem.errors()
    for(var i = 0; i < errMsgs.length; i++) {
      errors.push(errMsgs[i]);
    }
    req.flash('errors', errors)
  }
  res.redirect('/');
});

module.exports = router;
