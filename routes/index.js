var app = require('../app.js')
var db = app.get('db')

exports.index = function(req, res) {
  db.get('queue', function(err, value) {
    if(err) {
      console.log("OH GOD WHAT", err);
      // Probably render an error
    }
    else {
      console.log('Got a value: ' + value)
      queue = JSON.parse(value);

      // If posting, add it to the queue
      if(req.body.queue !== undefined) {
        toQueue = req.body.queue;
        queue.push(toQueue);
        db.put('queue', JSON.stringify(queue), function(err) {
          console.log("OH GOD WHAT", err);
        });
      }

      res.render('index', { title: 'Express', queue: queue });
    }
  });
};
