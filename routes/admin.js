var express = require('express');
var router = express.Router();
var clearQueue = require('../lib/clearQueue.js');
var getQueue = require('../lib/getQueue.js');

router.get('/', function(req, res) {
  getQueue(req.db, res, function(queue) {
    res.render('admin', { queue: queue });
  });
});

router.post('/clear', function(req, res) {
  queue = clearQueue(req.db, res);
  res.redirect('/admin');
});

module.exports = router;
