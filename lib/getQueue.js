module.exports = function(db, res, callback) {
  db.get('queue', function(err, value) {
    if(err) {
      if(err.notFound) {
        callback(clearQueue(db, res));
      }
      else {
        res.render('error', { error: err });
      }
    }
    else {
      callback(JSON.parse(value));
    }
  });
}
