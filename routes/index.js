var express = require('express');
var router = express.Router();
var clearQueue = require('../lib/clearQueue.js');
var getQueue = require('../lib/getQueue.js');

router.get('/', function(req, res) {
  db = req.db;
  getQueue(db, res, function(queue) {
    if(req.body.queue !== undefined) {
      toQueue = req.body.queue;
      queue.push(toQueue);
      db.put('queue', queue, function(err) {
        if(err) res.render('error', { error: err });
        else res.render('index', { queue: queue });
      });
    }
    else res.render('index', { queue: queue });
  });
});

module.exports = router;
