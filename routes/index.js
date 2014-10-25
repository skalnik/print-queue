var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');

router.get('/', function(req, res) {
  req.redis.lrange(req.redisKey, 0, -1, function(err, queue) {
    if(err) { res.render('error', { error: err }) }
    else {
      queueItems = queue.map(function(item) {
        return new QueueItem(JSON.parse(item));
      });
      res.render('index', { queue: queueItems });
    }
  });
});

router.post('/', function(req, res) {
  var locals = { queue: [], errors: [] };
  var queueItem = new QueueItem(req.body.queue);
  if(queueItem && queueItem.valid()) {
    req.redis.lpush(req.redisKey, JSON.stringify(queueItem), function(err) {
      if(err) { local.errors.push("Could not save item: " + err); }
      else { locals.queue.push(queueItem); }
    });
  }
  else {
    errors = queueItem.errors()
    for(var i = 0; i < errors.length; i++) {
      locals.errors.push(errors[i]);
    }
  }

  req.redis.lrange(req.redisKey, 0, -1, function(err, queue) {
    if(err) { locals.errors.push("Could not get queue: " + err) }
    else {
      queueItems = queue.map(function(item) {
        return new QueueItem(JSON.parse(item));
      });
      res.render('index', { queue: queueItems });
    }
  });
});

module.exports = router;
