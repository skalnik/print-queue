var express = require('express');
var router = express.Router();
var auth = require('basic-auth');
var clearQueue = require('../lib/clearQueue.js');
var getQueue = require('../lib/getQueue.js');

router.all('*', function(req, res, next) {
  user = auth(req);
  if (user === undefined || user['pass'] !== req.password) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
      res.end('Unauthorized');
  } else {
    next();
  }
});

router.get('/', function(req, res) {
  getQueue(req.db, res, function(queue) {
    res.render('admin', { queue: queue });
  });
});

router.delete('/queue', function(req, res) {
  queue = clearQueue(req.db, res);
  res.redirect('/admin');
});

module.exports = router;
