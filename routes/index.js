var express = require('express');
var router = express.Router();
var getQueue = require('../lib/getQueue.js');
var validate = require('../lib/validate.js');

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
    var queueItem = req.body.queue;
    if(queueItem !== undefined) {
      queueItemValid = validate(queueItem);
      if(queueItemValid.valid) {
        queue.push(queueItem);
        db.put('queue', queue, function(err) {
          if(err) {
            locals.errors.push("Could not update database!");
            locals.errors.push(err);
          }
        });
      }
      else {
        for(var i in queueItemValid.msgs) {
          msg = queueItemValid.msgs[i];
          locals.errors.push(msg);
        }
      }
    }
    else { locals.errors.push('Nothing submitted!') }
    res.render('index', locals);
  });
});

module.exports = router;
