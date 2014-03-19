var app = require('../app.js')
var db = app.get('db')

var clearQueue = function(res) {
  queue = [];
  db.put('queue', JSON.stringify(queue), function(err) {
    res.render('error', { error: err });
  });
  return queue;
}

exports.index = function(req, res) {
  db.get('queue', function(err, value) {
    if(err) {
      if(err.notFound) {
        // No queue set yet, lets fix that
        queue = clearQueue(res);
        res.render('index', { queue: queue });
      }
      else {
        res.render('error', { error: err })
      }
    }
    else {
      queue = JSON.parse(value);

      if(req.body.queue !== undefined) {
        toQueue = req.body.queue;
        queue.push(toQueue);
        db.put('queue', JSON.stringify(queue), function(err) {
          res.render('error', { error: err })
        });
      }

      res.render('index', { queue: queue });
    }
  });
};

exports.clear = function(req, res) {
  queue = clearQueue(res);
  res.render('index', { queue: queue });
};
