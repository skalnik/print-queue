module.exports = function(db, res) {
  queue = [];
  db.put('queue', queue, function(err) {
    res.render('error', { error: err });
  });
  return queue;
}
