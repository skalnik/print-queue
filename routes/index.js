var express = require('express');
var router = express.Router();
var getQueue = require('../lib/getQueue.js');
var newItem = require('../lib/newQueueItem.js');

router.get('/', function(req, res) {
  db = req.db;
  getQueue(db, res, function(queue) {
    res.render('index', { queue: queue });
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
