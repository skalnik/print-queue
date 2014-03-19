module.exports = function(db, res) {
  queue = [];
  db.put('queue', JSON.stringify(queue), function(err) {
    res.render('error', { error: err });
  });
  return queue;
}
