var express = require('express');
var router = express.Router();
var QueueItem = require('../lib/queueItem.js');
var getQueue = require('../lib/getQueue.js');

router.get('/', function(req, res) {
  var redis = req.redis;
  var key = req.redisKey;
  redis.lrange(key, 0, -1, function(err, queue) {
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
  var db = req.db;
  var locals = { queue: [], errors: [] };
  getQueue(db, res, function(queue) {
    locals.queue = queue;
    var queueItem = newItem(req.body.queue);
    if(queueItem && queueItem.valid) {
      queue.push(queueItem);
      db.put('queue', queue, function(err) {
        if(err) {
          locals.errors.push("Could not update database!");
          locals.errors.push(err);
        }
      });
    }
    else {
      for(var i in queueItem.errors) {
        msg = queueItem.errors[i];
        locals.errors.push(msg);
      }
    }
    res.render('index', locals);
  });
});

module.exports = router;
