clearQueue = require('./clearQueue.js');
module.exports = function(db, res, callback) {
  db.get('queue', function(err, value) {
    if(err) {
      // No queue found? Clear it to make an empty one.
      if(err.notFound) {
        callback(clearQueue(db, res));
      }
      else {
        res.render('error', { error: err });
      }
    }
    else {
      callback(value);
    }
  });
}
