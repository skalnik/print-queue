var app = require('../app.js')
var db = app.get('db')
var clearQueue = require('../lib/clearQueue.js');
var getQueue = require('../lib/getQueue.js');

exports.index = function(req, res) {
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
};
