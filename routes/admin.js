var app = require('../app.js')
var db = app.get('db')
var clearQueue = require('../lib/clearQueue.js');
var getQueue = require('../lib/getQueue.js');

exports.index = function(req, res) {
  getQueue(db, res, function(queue) {
    res.render('admin', { queue: queue });
  });
};

exports.clear = function(req, res) {
  queue = clearQueue(db, res);
  res.redirect('/admin');
};
