var app = require('../app.js')
var db = app.get('db')
var clearQueue = require('../lib/clearQueue.js');

exports.clear = function(req, res) {
  queue = clearQueue(db, res);
  res.render('index', { queue: queue });
};
